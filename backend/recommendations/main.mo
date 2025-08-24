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

actor Recommendations {
    // Types
    public type ContentType = {
        #course;
        #session;
        #tutorial;
        #project;
        #partner;
    };

    public type UserPreference = {
        userId: Principal;
        interests: [Text];
        learningStyle: Text; // "visual", "auditory", "kinesthetic", "reading"
        difficultyPreference: Text; // "beginner", "intermediate", "advanced"
        sessionDurationPreference: Nat; // in minutes
        preferredTimes: [Text]; // ["morning", "afternoon", "evening"]
        updatedAt: Int;
    };

    public type Recommendation = {
        id: Text;
        userId: Principal;
        contentId: Text;
        contentType: ContentType;
        title: Text;
        description: Text;
        score: Nat; // 0-100 relevance score
        reason: Text; // Why this was recommended
        tags: [Text];
        createdAt: Int;
        viewed: Bool;
        clicked: Bool;
        completed: Bool;
    };

    public type UserInteraction = {
        userId: Principal;
        contentId: Text;
        contentType: ContentType;
        interactionType: Text; // "view", "click", "complete", "like", "share"
        timestamp: Int;
        duration: ?Nat; // in seconds, for view interactions
        rating: ?Nat; // 1-5 stars, for rating interactions
    };

    public type SimilarUser = {
        userId: Principal;
        similarityScore: Nat; // 0-100
        commonInterests: [Text];
        commonCompletions: [Text];
    };

    // State
    private stable var preferenceEntries: [(Principal, UserPreference)] = [];
    private var userPreferences = HashMap.fromIter<Principal, UserPreference>(preferenceEntries.vals(), 10, Principal.equal, Principal.hash);

    private stable var recommendationEntries: [(Text, Recommendation)] = [];
    private var recommendations = HashMap.fromIter<Text, Recommendation>(recommendationEntries.vals(), 10, Text.equal, Text.hash);

    private stable var interactionEntries: [(Text, UserInteraction)] = [];
    private var userInteractions = HashMap.fromIter<Text, UserInteraction>(interactionEntries.vals(), 10, Text.equal, Text.hash);

    private stable var nextRecommendationId: Nat = 0;
    private stable var nextInteractionId: Nat = 0;

    // User Preferences Management
    public shared(msg) func updateUserPreferences(
        interests: [Text],
        learningStyle: Text,
        difficultyPreference: Text,
        sessionDurationPreference: Nat,
        preferredTimes: [Text]
    ) : async Result.Result<UserPreference, Text> {
        let caller = msg.caller;

        let preferences: UserPreference = {
            userId = caller;
            interests = interests;
            learningStyle = learningStyle;
            difficultyPreference = difficultyPreference;
            sessionDurationPreference = sessionDurationPreference;
            preferredTimes = preferredTimes;
            updatedAt = Time.now();
        };

        userPreferences.put(caller, preferences);
        
        // Regenerate recommendations when preferences change
        ignore await generateRecommendations(caller);
        
        #ok(preferences)
    };

    public query(msg) func getUserPreferences() : async ?UserPreference {
        userPreferences.get(msg.caller)
    };

    // Recommendation Generation
    public shared(msg) func generateRecommendations(userId: Principal) : async Result.Result<[Recommendation], Text> {
        let preferences = switch (userPreferences.get(userId)) {
            case (?prefs) prefs;
            case null {
                return #err("User preferences not found");
            };
        };

        let newRecommendations = Buffer.Buffer<Recommendation>(0);

        // Content-based recommendations (based on interests)
        let contentRecommendations = await generateContentBasedRecommendations(userId, preferences);
        for (rec in contentRecommendations.vals()) {
            newRecommendations.add(rec);
        };

        // Collaborative filtering recommendations (based on similar users)
        let collaborativeRecommendations = await generateCollaborativeRecommendations(userId);
        for (rec in collaborativeRecommendations.vals()) {
            newRecommendations.add(rec);
        };

        // Popular content recommendations
        let popularRecommendations = await generatePopularRecommendations(userId, preferences);
        for (rec in popularRecommendations.vals()) {
            newRecommendations.add(rec);
        };

        #ok(Buffer.toArray(newRecommendations))
    };

    public shared(msg) func getMyRecommendations(limit: ?Nat) : async [Recommendation] {
        let caller = msg.caller;
        let myRecommendations = Buffer.Buffer<Recommendation>(0);
        let maxResults = switch (limit) { case (?l) l; case null 20 };
        var count = 0;
        
        for ((_, recommendation) in recommendations.entries()) {
            if (Principal.equal(recommendation.userId, caller) and count < maxResults) {
                myRecommendations.add(recommendation);
                count += 1;
            };
        };
        
        Buffer.toArray(myRecommendations)
    };

    // Interaction Tracking
    public shared(msg) func recordInteraction(
        contentId: Text,
        contentType: ContentType,
        interactionType: Text,
        duration: ?Nat,
        rating: ?Nat
    ) : async Result.Result<UserInteraction, Text> {
        let caller = msg.caller;
        let interactionId = "interaction_" # Nat.toText(nextInteractionId);
        nextInteractionId += 1;

        let interaction: UserInteraction = {
            userId = caller;
            contentId = contentId;
            contentType = contentType;
            interactionType = interactionType;
            timestamp = Time.now();
            duration = duration;
            rating = rating;
        };

        userInteractions.put(interactionId, interaction);

        // Update recommendation status if applicable
        updateRecommendationStatus(caller, contentId, interactionType);

        #ok(interaction)
    };

    public shared(msg) func markRecommendationViewed(recommendationId: Text) : async Result.Result<Bool, Text> {
        let caller = msg.caller;
        
        switch (recommendations.get(recommendationId)) {
            case null { #err("Recommendation not found") };
            case (?recommendation) {
                if (not Principal.equal(recommendation.userId, caller)) {
                    return #err("Unauthorized");
                };

                let updatedRecommendation: Recommendation = {
                    recommendation with viewed = true;
                };

                recommendations.put(recommendationId, updatedRecommendation);
                #ok(true)
            };
        }
    };

    // Similar Users Discovery
    public shared(msg) func findSimilarUsers(limit: ?Nat) : async [SimilarUser] {
        let caller = msg.caller;
        let maxResults = switch (limit) { case (?l) l; case null 10 };
        let similarUsers = Buffer.Buffer<SimilarUser>(0);

        let myPreferences = switch (userPreferences.get(caller)) {
            case (?prefs) prefs;
            case null return [];
        };

        let myInteractions = getUserInteractionHistory(caller);

        for ((userId, otherPreferences) in userPreferences.entries()) {
            if (not Principal.equal(userId, caller) and similarUsers.size() < maxResults) {
                let similarityScore = calculateSimilarityScore(myPreferences, otherPreferences, myInteractions, getUserInteractionHistory(userId));
                
                if (similarityScore > 30) { // Only include users with >30% similarity
                    let commonInterests = findCommonInterests(myPreferences.interests, otherPreferences.interests);
                    let commonCompletions = findCommonCompletions(myInteractions, getUserInteractionHistory(userId));
                    
                    let similarUser: SimilarUser = {
                        userId = userId;
                        similarityScore = similarityScore;
                        commonInterests = commonInterests;
                        commonCompletions = commonCompletions;
                    };
                    
                    similarUsers.add(similarUser);
                };
            };
        };

        Buffer.toArray(similarUsers)
    };

    // Private helper functions
    private func generateContentBasedRecommendations(userId: Principal, preferences: UserPreference) : async [Recommendation] {
        let recommendations = Buffer.Buffer<Recommendation>(0);
        
        // Mock content-based recommendations
        // In a real implementation, this would query content databases
        for (interest in preferences.interests.vals()) {
            let recommendationId = "rec_" # Nat.toText(nextRecommendationId);
            nextRecommendationId += 1;

            let recommendation: Recommendation = {
                id = recommendationId;
                userId = userId;
                contentId = "course_" # interest;
                contentType = #course;
                title = "Advanced " # interest # " Course";
                description = "Learn advanced concepts in " # interest;
                score = 85;
                reason = "Based on your interest in " # interest;
                tags = [interest, preferences.difficultyPreference];
                createdAt = Time.now();
                viewed = false;
                clicked = false;
                completed = false;
            };

            recommendations.add(recommendation);
            recommendations.put(recommendationId, recommendation);
        };

        Buffer.toArray(recommendations)
    };

    private func generateCollaborativeRecommendations(userId: Principal) : async [Recommendation] {
        let recommendations = Buffer.Buffer<Recommendation>(0);
        
        // Mock collaborative filtering recommendations
        // In a real implementation, this would analyze similar users' preferences
        let recommendationId = "rec_" # Nat.toText(nextRecommendationId);
        nextRecommendationId += 1;

        let recommendation: Recommendation = {
            id = recommendationId;
            userId = userId;
            contentId = "popular_session_123";
            contentType = #session;
            title = "Popular Learning Session";
            description = "Highly rated session by users with similar interests";
            score = 78;
            reason = "Users like you also enjoyed this session";
            tags = ["popular", "recommended"];
            createdAt = Time.now();
            viewed = false;
            clicked = false;
            completed = false;
        };

        recommendations.add(recommendation);
        recommendations.put(recommendationId, recommendation);

        Buffer.toArray(recommendations)
    };

    private func generatePopularRecommendations(userId: Principal, preferences: UserPreference) : async [Recommendation] {
        let recommendations = Buffer.Buffer<Recommendation>(0);
        
        // Mock popular content recommendations
        let recommendationId = "rec_" # Nat.toText(nextRecommendationId);
        nextRecommendationId += 1;

        let recommendation: Recommendation = {
            id = recommendationId;
            userId = userId;
            contentId = "trending_tutorial_456";
            contentType = #tutorial;
            title = "Trending Tutorial";
            description = "Currently trending tutorial in your area of interest";
            score = 72;
            reason = "Trending content matching your preferences";
            tags = ["trending", "popular"];
            createdAt = Time.now();
            viewed = false;
            clicked = false;
            completed = false;
        };

        recommendations.add(recommendation);
        recommendations.put(recommendationId, recommendation);

        Buffer.toArray(recommendations)
    };

    private func updateRecommendationStatus(userId: Principal, contentId: Text, interactionType: Text) : () {
        for ((id, recommendation) in recommendations.entries()) {
            if (Principal.equal(recommendation.userId, userId) and recommendation.contentId == contentId) {
                let updatedRecommendation: Recommendation = switch (interactionType) {
                    case ("click") { recommendation with clicked = true };
                    case ("complete") { recommendation with completed = true };
                    case (_) recommendation;
                };
                recommendations.put(id, updatedRecommendation);
            };
        };
    };

    private func getUserInteractionHistory(userId: Principal) : [UserInteraction] {
        let interactions = Buffer.Buffer<UserInteraction>(0);
        
        for ((_, interaction) in userInteractions.entries()) {
            if (Principal.equal(interaction.userId, userId)) {
                interactions.add(interaction);
            };
        };
        
        Buffer.toArray(interactions)
    };

    private func calculateSimilarityScore(
        prefs1: UserPreference,
        prefs2: UserPreference,
        interactions1: [UserInteraction],
        interactions2: [UserInteraction]
    ) : Nat {
        var score: Nat = 0;

        // Interest similarity (40% weight)
        let commonInterests = findCommonInterests(prefs1.interests, prefs2.interests);
        let interestScore = (commonInterests.size() * 40) / (prefs1.interests.size() + prefs2.interests.size());
        score += interestScore;

        // Learning style similarity (20% weight)
        if (prefs1.learningStyle == prefs2.learningStyle) {
            score += 20;
        };

        // Difficulty preference similarity (20% weight)
        if (prefs1.difficultyPreference == prefs2.difficultyPreference) {
            score += 20;
        };

        // Interaction similarity (20% weight)
        let commonCompletions = findCommonCompletions(interactions1, interactions2);
        let interactionScore = if (interactions1.size() + interactions2.size() > 0) {
            (commonCompletions.size() * 20) / (interactions1.size() + interactions2.size())
        } else { 0 };
        score += interactionScore;

        score
    };

    private func findCommonInterests(interests1: [Text], interests2: [Text]) : [Text] {
        let common = Buffer.Buffer<Text>(0);
        
        for (interest1 in interests1.vals()) {
            for (interest2 in interests2.vals()) {
                if (interest1 == interest2) {
                    common.add(interest1);
                };
            };
        };
        
        Buffer.toArray(common)
    };

    private func findCommonCompletions(interactions1: [UserInteraction], interactions2: [UserInteraction]) : [Text] {
        let common = Buffer.Buffer<Text>(0);
        
        for (interaction1 in interactions1.vals()) {
            if (interaction1.interactionType == "complete") {
                for (interaction2 in interactions2.vals()) {
                    if (interaction2.interactionType == "complete" and interaction1.contentId == interaction2.contentId) {
                        common.add(interaction1.contentId);
                    };
                };
            };
        };
        
        Buffer.toArray(common)
    };

    // System upgrade hooks
    system func preupgrade() {
        preferenceEntries := userPreferences.entries() |> Iter.toArray(_);
        recommendationEntries := recommendations.entries() |> Iter.toArray(_);
        interactionEntries := userInteractions.entries() |> Iter.toArray(_);
    };

    system func postupgrade() {
        preferenceEntries := [];
        recommendationEntries := [];
        interactionEntries := [];
    };
}
