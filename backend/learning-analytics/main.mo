import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";

actor LearningAnalytics {
    // Types
    public type LearningSession = {
        id: Text;
        userId: Principal;
        contentId: Text;
        contentType: Text; // "course", "session", "tutorial", "project"
        startTime: Int;
        endTime: ?Int;
        duration: Nat; // in minutes
        completed: Bool;
        progress: Nat; // percentage 0-100
        xpEarned: Nat;
        date: Text; // YYYY-MM-DD format
    };

    public type CourseProgress = {
        userId: Principal;
        courseId: Text;
        courseName: Text;
        totalLessons: Nat;
        completedLessons: Nat;
        totalDuration: Nat; // in minutes
        timeSpent: Nat; // in minutes
        lastAccessed: Int;
        completionRate: Nat; // percentage 0-100
        xpEarned: Nat;
        status: Text; // "not_started", "in_progress", "completed", "paused"
    };

    public type DailyActivity = {
        userId: Principal;
        date: Text; // YYYY-MM-DD format
        sessionsCount: Nat;
        totalTimeSpent: Nat; // in minutes
        xpEarned: Nat;
        coursesAccessed: [Text];
    };

    public type WeeklyStats = {
        userId: Principal;
        weekDates: [Text]; // Array of 7 dates
        dailyHours: [Float]; // Hours spent each day
        totalHours: Float;
        averageHours: Float;
    };

    public type CourseStats = {
        userId: Principal;
        completed: Nat;
        inProgress: Nat;
        paused: Nat;
        notStarted: Nat;
        totalCourses: Nat;
        overallCompletionRate: Nat;
    };

    // State
    private stable var sessionEntries: [(Text, LearningSession)] = [];
    private var sessions = HashMap.fromIter<Text, LearningSession>(sessionEntries.vals(), 100, Text.equal, Text.hash);

    private stable var progressEntries: [(Text, CourseProgress)] = [];
    private var courseProgress = HashMap.fromIter<Text, CourseProgress>(progressEntries.vals(), 50, Text.equal, Text.hash);

    private stable var activityEntries: [(Text, DailyActivity)] = [];
    private var dailyActivities = HashMap.fromIter<Text, DailyActivity>(activityEntries.vals(), 200, Text.equal, Text.hash);

    private stable var nextSessionId: Nat = 0;

    // Session Management
    public shared(msg) func startLearningSession(
        contentId: Text,
        contentType: Text
    ) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        let sessionId = "session_" # Nat.toText(nextSessionId);
        nextSessionId += 1;

        let now = Time.now();
        let session: LearningSession = {
            id = sessionId;
            userId = caller;
            contentId = contentId;
            contentType = contentType;
            startTime = now;
            endTime = null;
            duration = 0;
            completed = false;
            progress = 0;
            xpEarned = 0;
            date = formatDate(now);
        };

        sessions.put(sessionId, session);
        #ok(sessionId)
    };

    public shared(msg) func endLearningSession(
        sessionId: Text,
        completed: Bool,
        progress: Nat,
        xpEarned: Nat
    ) : async Result.Result<LearningSession, Text> {
        let caller = msg.caller;
        
        switch (sessions.get(sessionId)) {
            case null { #err("Session not found") };
            case (?session) {
                if (not Principal.equal(session.userId, caller)) {
                    return #err("Unauthorized");
                };

                let endTime = Time.now();
                let durationNanos = Int.abs(endTime - session.startTime);
                let durationMinutes = durationNanos / 60_000_000_000; // Convert to minutes

                let updatedSession: LearningSession = {
                    session with
                    endTime = ?endTime;
                    duration = durationMinutes;
                    completed = completed;
                    progress = progress;
                    xpEarned = xpEarned;
                };

                sessions.put(sessionId, updatedSession);
                
                // Update daily activity
                ignore updateDailyActivity(caller, durationMinutes, xpEarned, session.contentId, session.date);
                
                #ok(updatedSession)
            };
        }
    };

    // Course Progress Management
    public shared(msg) func updateCourseProgress(
        courseId: Text,
        courseName: Text,
        totalLessons: Nat,
        completedLessons: Nat,
        timeSpent: Nat,
        xpEarned: Nat,
        status: Text
    ) : async Result.Result<CourseProgress, Text> {
        let caller = msg.caller;
        let progressId = Principal.toText(caller) # "_" # courseId;

        let completionRate = if (totalLessons > 0) {
            (completedLessons * 100) / totalLessons
        } else { 0 };

        let progress: CourseProgress = {
            userId = caller;
            courseId = courseId;
            courseName = courseName;
            totalLessons = totalLessons;
            completedLessons = completedLessons;
            totalDuration = 0;
            timeSpent = timeSpent;
            lastAccessed = Time.now();
            completionRate = completionRate;
            xpEarned = xpEarned;
            status = status;
        };

        courseProgress.put(progressId, progress);
        #ok(progress)
    };

    // Analytics Queries
    public query(msg) func getWeeklyStats() : async WeeklyStats {
        let caller = msg.caller;
        let now = Time.now();
        
        // Get last 7 days
        let weekDates = getLastSevenDays(now);
        let dailyHours = Buffer.Buffer<Float>(7);
        var totalHours: Float = 0;

        for (date in weekDates.vals()) {
            let activityId = Principal.toText(caller) # "_" # date;
            switch (dailyActivities.get(activityId)) {
                case null { dailyHours.add(0.0) };
                case (?activity) {
                    let hours = Float.fromInt(activity.totalTimeSpent) / 60.0;
                    dailyHours.add(hours);
                    totalHours += hours;
                };
            };
        };

        let averageHours = if (weekDates.size() > 0) {
            totalHours / Float.fromInt(weekDates.size())
        } else { 0.0 };

        {
            userId = caller;
            weekDates = weekDates;
            dailyHours = Buffer.toArray(dailyHours);
            totalHours = totalHours;
            averageHours = averageHours;
        }
    };

    public query(msg) func getCourseStats() : async CourseStats {
        let caller = msg.caller;
        var completed: Nat = 0;
        var inProgress: Nat = 0;
        var paused: Nat = 0;
        var notStarted: Nat = 0;
        var totalCourses: Nat = 0;
        var totalCompletionRate: Nat = 0;

        for ((_, progress) in courseProgress.entries()) {
            if (Principal.equal(progress.userId, caller)) {
                totalCourses += 1;
                totalCompletionRate += progress.completionRate;
                
                switch (progress.status) {
                    case ("completed") { completed += 1 };
                    case ("in_progress") { inProgress += 1 };
                    case ("paused") { paused += 1 };
                    case ("not_started") { notStarted += 1 };
                    case (_) { inProgress += 1 }; // Default to in_progress
                };
            };
        };

        let overallCompletionRate = if (totalCourses > 0) {
            totalCompletionRate / totalCourses
        } else { 0 };

        {
            userId = caller;
            completed = completed;
            inProgress = inProgress;
            paused = paused;
            notStarted = notStarted;
            totalCourses = totalCourses;
            overallCompletionRate = overallCompletionRate;
        }
    };

    public query(msg) func getMySessions() : async [LearningSession] {
        let caller = msg.caller;
        let userSessions = Buffer.Buffer<LearningSession>(0);
        
        for ((_, session) in sessions.entries()) {
            if (Principal.equal(session.userId, caller)) {
                userSessions.add(session);
            };
        };
        
        Buffer.toArray(userSessions)
    };

    public query(msg) func getMyCourseProgress() : async [CourseProgress] {
        let caller = msg.caller;
        let userProgress = Buffer.Buffer<CourseProgress>(0);
        
        for ((_, progress) in courseProgress.entries()) {
            if (Principal.equal(progress.userId, caller)) {
                userProgress.add(progress);
            };
        };
        
        Buffer.toArray(userProgress)
    };

    // Sample Data Generation (for testing)
    public shared(msg) func generateSampleData() : async Result.Result<Text, Text> {
        let caller = msg.caller;
        let now = Time.now();
        
        // Generate sample daily activities for the last 7 days
        let weekDates = getLastSevenDays(now);
        let sampleHours = [2.5, 4.2, 3.8, 5.1, 4.7, 3.2, 4.8]; // Sample hours for each day
        
        for (i in weekDates.keys()) {
            let date = weekDates[i];
            let hours = sampleHours[i];
            let minutes = Int.abs(Float.toInt(hours * 60.0));
            
            let activityId = Principal.toText(caller) # "_" # date;
            let activity: DailyActivity = {
                userId = caller;
                date = date;
                sessionsCount = 2;
                totalTimeSpent = minutes;
                xpEarned = minutes / 10; // 1 XP per 10 minutes
                coursesAccessed = ["react-course", "javascript-course"];
            };
            dailyActivities.put(activityId, activity);
        };

        // Generate sample course progress
        let courses = [
            ("react-course", "Advanced React Patterns", 20, 12, "in_progress"),
            ("javascript-course", "JavaScript Fundamentals", 15, 15, "completed"),
            ("typescript-course", "TypeScript Mastery", 18, 8, "in_progress"),
            ("node-course", "Node.js Backend", 25, 0, "not_started"),
            ("css-course", "Modern CSS Grid", 12, 5, "paused"),
        ];

        for ((courseId, courseName, totalLessons, completedLessons, status) in courses.vals()) {
            let progressId = Principal.toText(caller) # "_" # courseId;
            let completionRate = if (totalLessons > 0) {
                (completedLessons * 100) / totalLessons
            } else { 0 };

            let progress: CourseProgress = {
                userId = caller;
                courseId = courseId;
                courseName = courseName;
                totalLessons = totalLessons;
                completedLessons = completedLessons;
                totalDuration = totalLessons * 30; // 30 minutes per lesson
                timeSpent = completedLessons * 30;
                lastAccessed = now;
                completionRate = completionRate;
                xpEarned = completedLessons * 50; // 50 XP per lesson
                status = status;
            };
            courseProgress.put(progressId, progress);
        };

        #ok("Sample data generated successfully")
    };

    // Private helper functions
    private func updateDailyActivity(
        userId: Principal,
        timeSpent: Nat,
        xpEarned: Nat,
        contentId: Text,
        date: Text
    ) : () {
        let activityId = Principal.toText(userId) # "_" # date;

        switch (dailyActivities.get(activityId)) {
            case null {
                let activity: DailyActivity = {
                    userId = userId;
                    date = date;
                    sessionsCount = 1;
                    totalTimeSpent = timeSpent;
                    xpEarned = xpEarned;
                    coursesAccessed = [contentId];
                };
                dailyActivities.put(activityId, activity);
            };
            case (?existing) {
                let updatedActivity: DailyActivity = {
                    existing with
                    sessionsCount = existing.sessionsCount + 1;
                    totalTimeSpent = existing.totalTimeSpent + timeSpent;
                    xpEarned = existing.xpEarned + xpEarned;
                    coursesAccessed = Array.append(existing.coursesAccessed, [contentId]);
                };
                dailyActivities.put(activityId, updatedActivity);
            };
        };
    };

    private func formatDate(timestamp: Int) : Text {
        // Simple date formatting - in production, use proper date library
        let days = Int.abs(timestamp) / (24 * 60 * 60 * 1_000_000_000);
        let epochDays = 19358; // Days since epoch to 2023-01-01
        let totalDays = epochDays + days;
        
        // Simple calculation for demo purposes
        let year = 2024;
        let month = ((totalDays % 365) / 30) + 1;
        let day = (totalDays % 30) + 1;
        
        let monthStr = if (month < 10) "0" # Nat.toText(month) else Nat.toText(month);
        let dayStr = if (day < 10) "0" # Nat.toText(day) else Nat.toText(day);
        
        Nat.toText(year) # "-" # monthStr # "-" # dayStr
    };

    private func getLastSevenDays(timestamp: Int) : [Text] {
        let today = formatDate(timestamp);
        let buffer = Buffer.Buffer<Text>(7);
        
        // For demo purposes, generate last 7 days
        let dayNames = ["2024-01-13", "2024-01-14", "2024-01-15", "2024-01-16", "2024-01-17", "2024-01-18", "2024-01-19"];
        
        for (day in dayNames.vals()) {
            buffer.add(day);
        };
        
        Buffer.toArray(buffer)
    };

    // System upgrade hooks
    system func preupgrade() {
        sessionEntries := sessions.entries() |> Iter.toArray(_);
        progressEntries := courseProgress.entries() |> Iter.toArray(_);
        activityEntries := dailyActivities.entries() |> Iter.toArray(_);
    };

    system func postupgrade() {
        sessionEntries := [];
        progressEntries := [];
        activityEntries := [];
    };
}
