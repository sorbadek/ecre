import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Order "mo:base/Order";
import Nat32 "mo:base/Nat32";

actor NotificationsCanister {
    // Types
    public type ActivityType = {
        #comment;
        #quiz_completed;
        #deadline_approaching;
        #course_available;
        #achievement_earned;
        #session_joined;
        #partner_request;
        #study_group_invite;
    };

    public type Activity = {
        id: Text;
        title: Text;
        userId: Principal;
        metadata: ?Text;
        activityType: ActivityType;
        description: ?Text;
        // timestamp is an Int as returned by Time.now()
        timestamp: Int;
        priority: Nat;
        isRead: Bool;
        expiresAt: ?Int;
    };

    public type NotificationPreferences = {
        userId: Principal;
        activityTypes: [ActivityType];
        weeklyDigest: Bool;
        emailNotifications: Bool;
        inAppNotifications: Bool;
        pushNotifications: Bool;
    };

    // State
    private stable var nextActivityId: Nat = 1;
    private var activities = HashMap.HashMap<Text, Activity>(10, Text.equal, Text.hash);
    private var userActivities = HashMap.HashMap<Principal, [Text]>(10, Principal.equal, Principal.hash);
    private var preferences = HashMap.HashMap<Principal, NotificationPreferences>(10, Principal.equal, Principal.hash);

    // Helper functions
    private func generateId(): Text {
        let id = "activity_" # Nat.toText(nextActivityId);
        nextActivityId := nextActivityId + 1;
        id
    };

    private func addActivityToUser(userId: Principal, activityId: Text) {
        let currentActivities = switch (userActivities.get(userId)) {
            case null { [] };
            case (?acts) { acts };
        };
        let newActivities = Array.append(currentActivities, [activityId]);
        userActivities.put(userId, newActivities);
    };

    // Public functions
    public shared(msg) func createActivity(
        activityType: ActivityType,
        title: Text,
        description: ?Text,
        metadata: ?Text,
        priority: Nat,
        expiresAt: ?Int
    ): async Result.Result<Activity, Text> {
        let caller = msg.caller;
        let activityId = generateId();
        let timestamp = Time.now();

        let activity: Activity = {
            id = activityId;
            title = title;
            userId = caller;
            metadata = metadata;
            activityType = activityType;
            description = description;
            timestamp = timestamp;
            priority = priority;
            isRead = false;
            expiresAt = expiresAt;
        };

        activities.put(activityId, activity);
        addActivityToUser(caller, activityId);

        #ok(activity)
    };

    public shared(msg) func getMyActivities(limit: ?Nat): async [Activity] {
        let caller = msg.caller;
        let userActivityIds = switch (userActivities.get(caller)) {
            case null { [] };
            case (?ids) { ids };
        };

        // map ids -> Activity (filter out missing)
        let userActivitiesArray = Array.mapFilter<Text, Activity>(userActivityIds, func(id) {
            activities.get(id)
        });

        // Sort by timestamp (newest first)
        let sortedActivities = Array.sort<Activity>(
            userActivitiesArray,
            func(a, b) {
                if (a.timestamp < b.timestamp) { #greater }
                else if (a.timestamp > b.timestamp) { #less }
                else { #equal }
            }
        );

        switch (limit) {
            case null { sortedActivities };
            case (?n) { 
                if (sortedActivities.size() <= n) {
                    sortedActivities
                } else {
                    Array.subArray(sortedActivities, 0, n)
                }
            };
        }
    };

    public shared(msg) func markActivityAsRead(activityId: Text): async Result.Result<Activity, Text> {
        let caller = msg.caller;
        
        switch (activities.get(activityId)) {
            case null { #err("Activity not found") };
            case (?activity) {
                if (not Principal.equal(activity.userId, caller)) {
                    #err("Unauthorized")
                } else {
                    let updatedActivity = {
                        activity with isRead = true
                    };
                    activities.put(activityId, updatedActivity);
                    #ok(updatedActivity)
                }
            };
        }
    };

    public shared(msg) func getUnreadCount(): async Nat {
        let caller = msg.caller;
        let userActivityIds = switch (userActivities.get(caller)) {
            case null { [] };
            case (?ids) { ids };
        };

        var count: Nat = 0;
        for (id in userActivityIds.vals()) {
            switch (activities.get(id)) {
                case null { };
                case (?activity) {
                    if (not activity.isRead) {
                        count := count + 1;
                    }
                };
            };
        };
        count
    };

    public shared(msg) func updatePreferences(
        emailNotifications: Bool,
        inAppNotifications: Bool,
        pushNotifications: Bool,
        weeklyDigest: Bool,
        activityTypes: [ActivityType]
    ): async Result.Result<NotificationPreferences, Text> {
        let caller = msg.caller;
        
        let prefs: NotificationPreferences = {
            userId = caller;
            activityTypes = activityTypes;
            weeklyDigest = weeklyDigest;
            emailNotifications = emailNotifications;
            inAppNotifications = inAppNotifications;
            pushNotifications = pushNotifications;
        };

        preferences.put(caller, prefs);
        #ok(prefs)
    };

    public shared(msg) func getMyPreferences(): async ?NotificationPreferences {
        let caller = msg.caller;
        preferences.get(caller)
    };

    public shared(msg) func generateSampleActivities(): async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        let sampleActivities = [
            (#quiz_completed, "Quiz completed: React Fundamentals", ?"You scored 95% on the React Fundamentals quiz!", ?"{\"score\": 95, \"quiz\": \"react-fundamentals\"}", 2, null),
            (#course_available, "New course available: Advanced TypeScript", ?"A new course on Advanced TypeScript patterns is now available.", ?"{\"course\": \"advanced-typescript\", \"instructor\": \"Sarah Chen\"}", 1, null),
            (#achievement_earned, "Achievement earned: Code Warrior", ?"You've completed 10 coding challenges this week!", ?"{\"achievement\": \"code-warrior\", \"xp\": 500}", 3, null),
            (#session_joined, "Study session joined", ?"You joined the 'React Best Practices' study session.", ?"{\"session\": \"react-best-practices\", \"host\": \"Michael Rodriguez\"}", 1, null),
            (#deadline_approaching, "Assignment deadline approaching", ?"Your Node.js project is due in 2 days.", ?"{\"assignment\": \"nodejs-project\", \"daysLeft\": 2}", 3, null)
        ];

        for ((activityType, title, description, metadata, priority, expiresAt) in sampleActivities.vals()) {
            let activityId = generateId();

            // --- Portable approach (uses only Int arithmetic) ---
            let now: Int = Time.now();
            let secondsInDayNs: Int = 86400 * 1_000_000_000;
            // offsetSec in 0..86399 computed from current time (portable; no Nat conversions)
            let offsetSec: Int = (now % secondsInDayNs) / 1_000_000_000;
            let timestamp: Int = now - (offsetSec * 1_000_000_000);

            // markRead: simple determinism using now (0/1)
            let markRead: Bool = ((now / 1_000_000_000) % 2 == 0);

            /* 
            // --- Alternative: hash-based offset (UNCOMMENT if your stdlib supports Nat % Int and Nat ops) ---
            // let offsetNat : Nat = Text.hash(activityId) % 86400;
            // let timestamp : Int = Time.now() - (offsetNat * 1_000_000_000); // might need a conversion on some stdlibs
            // let markRead : Bool = (Text.hash(activityId) % 2 == 0);
            //
            // If you prefer the hash-based approach and your compiler errors, paste the exact error and I will provide the precise conversion for your stdlib.
            */

            let activity: Activity = {
                id = activityId;
                title = title;
                userId = caller;
                metadata = metadata;
                activityType = activityType;
                description = description;
                timestamp = timestamp;
                priority = priority;
                isRead = markRead;
                expiresAt = expiresAt;
            };

            activities.put(activityId, activity);
            addActivityToUser(caller, activityId);
        };

        #ok("Generated 5 sample activities")
    };

    public func cleanupExpiredActivities(): async Nat {
        let now = Time.now();
        var cleanedCount: Nat = 0;

        let activityEntries = Iter.toArray(activities.entries());
        for ((id, activity) in activityEntries.vals()) {
            switch (activity.expiresAt) {
                case null { };
                case (?expiry) {
                    if (now > expiry) {
                        activities.delete(id);
                        cleanedCount := cleanedCount + 1;
                    }
                };
            };
        };

        cleanedCount
    };

    // System functions for upgrades
    system func preupgrade() {
        Debug.print("Preparing to upgrade notifications canister...");
    };

    system func postupgrade() {
        Debug.print("Notifications canister upgraded successfully");
    };
}
