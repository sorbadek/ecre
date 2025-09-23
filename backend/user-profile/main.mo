import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";

persistent actor UserProfile {
    // Types
    public type UserProfile = {
        id: Principal;
        name: Text;
        email: Text;
        bio: Text;
        location: ?Text;
        jobTitle: ?Text;
        company: ?Text;
        education: ?Text;
        avatarUrl: Text;
        coverUrl: Text;
        xpBalance: Nat;
        reputation: Nat;
        skills: [Text];
        interests: [Text];
        socialLinks: [SocialLink];
        settings: UserSettings;
        files: [UserFile];
        createdAt: Int;
        updatedAt: Int;
    };

    public type SocialLink = {
        platform: Text;
        url: Text;
    };

    public type UserSettings = {
        notifications: Bool;
        privacy: Text; // "public", "private", "friends"
        theme: Text; // "light", "dark", "auto"
        language: Text;
        emailNotifications: Bool;
        profileVisibility: Text; // "public", "private"
    };

    public type UserFile = {
        id: Text;
        filename: Text;
        contentType: Text;
        size: Nat;
        url: Text;
        category: Text; // "avatar", "cover", "document", "image", "other"
        uploadedAt: Int;
        tags: [Text];
    };

    public type XPTransaction = {
        id: Text;
        userId: Principal;
        amount: Int; // Can be negative for spending
        reason: Text;
        source: Text; // "session_completion", "course_finish", "purchase", etc.
        timestamp: Int;
        metadata: Text; // Additional context as JSON string
    };

    public type ProfileUpdate = {
        name: ?Text;
        email: ?Text;
        bio: ?Text;
        location: ?Text;
        jobTitle: ?Text;
        company: ?Text;
        education: ?Text;
        avatarUrl: ?Text;
        coverUrl: ?Text;
        skills: ?[Text];
        interests: ?[Text];
        socialLinks: ?[SocialLink];
        settings: ?UserSettingsUpdate;
    };

    public type UserSettingsUpdate = {
        theme: ?Text;
        notifications: ?Bool;
        privacy: ?Text;
        language: ?Text;
        emailNotifications: ?Bool;
        profileVisibility: ?Text;
    };

    // Stable state for persistence across upgrades
    private stable let PROFILE_MAP_SIZE = 1000;
    private stable let TRANSACTION_MAP_SIZE = 10000;
    private stable let FILE_MAP_SIZE = 10000;
    
    // Stable storage for profiles
    private stable var profilesEntries: [(Principal, UserProfile)] = [];
    private var profiles = HashMap.fromIter<Principal, UserProfile>(profilesEntries.vals(), PROFILE_MAP_SIZE, Principal.equal, Principal.hash);
    
    // Stable storage for XP transactions
    private stable var xpTransactionEntries: [(Text, XPTransaction)] = [];
    private var xpTransactions = HashMap.fromIter<Text, XPTransaction>(xpTransactionEntries.vals(), TRANSACTION_MAP_SIZE, Text.equal, Text.hash);
    
    // Stable storage for user files
    private stable var userFileEntries: [(Text, UserFile)] = [];
    private var userFiles = HashMap.fromIter<Text, UserFile>(userFileEntries.vals(), FILE_MAP_SIZE, Text.equal, Text.hash);
    
    // System functions for stable storage
    system func preupgrade() {
        profilesEntries := Iter.toArray(profiles.entries());
        xpTransactionEntries := Iter.toArray(xpTransactions.entries());
        userFileEntries := Iter.toArray(userFiles.entries());
    }
    
    // Counters
    private stable var nextTransactionId : Nat = 0;
    private stable var nextFileId : Nat = 0;
    
    // With enhanced orthogonal persistence, we don't need manual upgrade hooks
    // as the runtime automatically handles state persistence across upgrades

    // Helper functions
    private func generateTransactionId(): Text {
        let id = "xp_" # Nat.toText(nextTransactionId);
        nextTransactionId += 1;
        id
    };

    private func generateFileId(): Text {
        let id = "file_" # Nat.toText(nextFileId);
        nextFileId += 1;
        id
    };

    private func getCurrentTime(): Int {
        Time.now()
    };

    // Profile Management
    public shared(msg) func createProfile(name: Text, email: Text) : async Result.Result<UserProfile, Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case (?existing) { #err("Profile already exists") };
            case null {
                let profile: UserProfile = {
                    id = caller;
                    name = name;
                    email = email;
                    bio = "";
                    location = null;
                    jobTitle = null;
                    company = null;
                    education = null;
                    avatarUrl = "";
                    coverUrl = "";
                    xpBalance = 0;
                    reputation = 0;
                    skills = [];
                    interests = [];
                    socialLinks = [];
                    settings = {
                        notifications = true;
                        privacy = "public";
                        theme = "light";
                        language = "en";
                        emailNotifications = true;
                        profileVisibility = "public";
                    };
                    files = [];
                    createdAt = getCurrentTime();
                    updatedAt = getCurrentTime();
                };
                profiles.put(caller, profile);
                #ok(profile)
            };
        }
    };

    // Helper function to update nested settings
    private func updateSettings(current: UserSettings, update: ?UserSettingsUpdate) : UserSettings {
        switch(update) {
            case (null) { current };
            case (?u) {
                {
                    theme = Option.get(u.theme, current.theme);
                    notifications = Option.get(u.notifications, current.notifications);
                    privacy = Option.get(u.privacy, current.privacy);
                    language = Option.get(u.language, current.language);
                    emailNotifications = Option.get(u.emailNotifications, current.emailNotifications);
                    profileVisibility = Option.get(u.profileVisibility, current.profileVisibility);
                }
            };
        }
    };

    public shared(msg) func updateProfile(update: ProfileUpdate) : async Result.Result<UserProfile, Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case null { #err("Profile not found. Please create a profile first.") };
            case (?profile) {
                let updatedProfile: UserProfile = {
                    id = profile.id;
                    name = Option.get(update.name, profile.name);
                    email = Option.get(update.email, profile.email);
                    bio = Option.get(update.bio, profile.bio);
                    location = update.location;
                    jobTitle = update.jobTitle;
                    company = update.company;
                    education = update.education;
                    avatarUrl = Option.get(update.avatarUrl, profile.avatarUrl);
                    coverUrl = Option.get(update.coverUrl, profile.coverUrl);
                    xpBalance = profile.xpBalance;
                    reputation = profile.reputation;
                    skills = Option.get(update.skills, profile.skills);
                    interests = Option.get(update.interests, profile.interests);
                    socialLinks = Option.get(update.socialLinks, profile.socialLinks);
                    settings = updateSettings(profile.settings, update.settings);
                    files = profile.files;
                    createdAt = profile.createdAt;
                    updatedAt = getCurrentTime();
                };
                profiles.put(caller, updatedProfile);
                #ok(updatedProfile)
            };
        }
    };

    public shared(msg) func updateAvatar(avatarUrl: Text) : async Result.Result<UserProfile, Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case null { #err("Profile not found") };
            case (?profile) {
                let updatedProfile: UserProfile = {
                    profile with 
                    avatarUrl = avatarUrl;
                    updatedAt = getCurrentTime();
                };
                profiles.put(caller, updatedProfile);
                #ok(updatedProfile)
            };
        }
    };

    public shared(msg) func updateCover(coverUrl: Text) : async Result.Result<UserProfile, Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case null { #err("Profile not found") };
            case (?profile) {
                let updatedProfile: UserProfile = {
                    profile with 
                    coverUrl = coverUrl;
                    updatedAt = getCurrentTime();
                };
                profiles.put(caller, updatedProfile);
                #ok(updatedProfile)
            };
        }
    };

    public query(msg) func getMyProfile() : async ?UserProfile {
        profiles.get(msg.caller)
    };

    public query func getProfile(userId: Principal) : async ?UserProfile {
        switch (profiles.get(userId)) {
            case (?profile) {
                // Check privacy settings
                if (profile.settings.profileVisibility == "public") {
                    ?profile
                } else {
                    null // Private profile
                }
            };
            case null { null };
        }
    };

    public query func getAllPublicProfiles() : async [UserProfile] {
        let publicProfiles = Buffer.Buffer<UserProfile>(0);
        
        for ((_, profile) in profiles.entries()) {
            if (profile.settings.profileVisibility == "public") {
                publicProfiles.add(profile);
            };
        };
        
        Buffer.toArray(publicProfiles)
    };

    // XP Management
    public shared(msg) func addXP(amount: Nat, reason: Text, source: Text, metadata: Text) : async Result.Result<Nat, Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case null { #err("Profile not found") };
            case (?profile) {
                let transactionId = generateTransactionId();

                let transaction: XPTransaction = {
                    id = transactionId;
                    userId = caller;
                    amount = amount;
                    reason = reason;
                    source = source;
                    timestamp = getCurrentTime();
                    metadata = metadata;
                };

                xpTransactions.put(transactionId, transaction);

                let newBalance = profile.xpBalance + amount;
                let updatedProfile: UserProfile = {
                    profile with 
                    xpBalance = newBalance;
                    updatedAt = getCurrentTime();
                };
                profiles.put(caller, updatedProfile);
                #ok(newBalance)
            };
        }
    };

    public shared(msg) func spendXP(amount: Nat, reason: Text, metadata: Text) : async Result.Result<Nat, Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case null { #err("Profile not found") };
            case (?profile) {
                if (profile.xpBalance < amount) {
                    return #err("Insufficient XP balance");
                };

                let transactionId = generateTransactionId();

                let transaction: XPTransaction = {
                    id = transactionId;
                    userId = caller;
                    amount = -Int.abs(amount);
                    reason = reason;
                    source = "purchase";
                    timestamp = getCurrentTime();
                    metadata = metadata;
                };

                xpTransactions.put(transactionId, transaction);

                let newBalance = profile.xpBalance - amount;
                let updatedProfile: UserProfile = {
                    profile with 
                    xpBalance = newBalance;
                    updatedAt = getCurrentTime();
                };
                profiles.put(caller, updatedProfile);
                #ok(newBalance)
            };
        }
    };

    public query(msg) func getXPBalance() : async Nat {
        switch (profiles.get(msg.caller)) {
            case (?profile) { profile.xpBalance };
            case null { 0 };
        }
    };

    public query(msg) func getXPTransactions() : async [XPTransaction] {
        let caller = msg.caller;
        let userTransactions = Buffer.Buffer<XPTransaction>(0);
        
        for ((_, transaction) in xpTransactions.entries()) {
            if (Principal.equal(transaction.userId, caller)) {
                userTransactions.add(transaction);
            };
        };
        
        // Sort by timestamp (newest first)
        let sortedArray = Buffer.toArray(userTransactions);
        Array.sort(sortedArray, func(a: XPTransaction, b: XPTransaction) : {#less; #equal; #greater} {
            if (a.timestamp > b.timestamp) { #less }
            else if (a.timestamp < b.timestamp) { #greater }
            else { #equal }
        })
    };

    // Social Links Management
    public shared(msg) func addSocialLink(platform: Text, url: Text) : async Result.Result<[SocialLink], Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case null { #err("Profile not found") };
            case (?profile) {
                let newLink: SocialLink = { platform = platform; url = url };
                let updatedLinks = Buffer.fromArray<SocialLink>(profile.socialLinks);
                updatedLinks.add(newLink);
                
                let updatedProfile: UserProfile = {
                    profile with 
                    socialLinks = Buffer.toArray(updatedLinks);
                    updatedAt = getCurrentTime();
                };
                
                profiles.put(caller, updatedProfile);
                #ok(updatedProfile.socialLinks)
            };
        }
    };

    public shared(msg) func removeSocialLink(platform: Text) : async Result.Result<[SocialLink], Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case null { #err("Profile not found") };
            case (?profile) {
                let updatedLinks = Buffer.fromArray<SocialLink>(profile.socialLinks);
                let filteredLinks = Buffer.filter<SocialLink>(
                    updatedLinks,
                    func(link) { link.platform != platform }
                );
                
                let updatedProfile: UserProfile = {
                    profile with 
                    socialLinks = Buffer.toArray(filteredLinks);
                    updatedAt = getCurrentTime();
                };
                
                profiles.put(caller, updatedProfile);
                #ok(updatedProfile.socialLinks)
            };
        }
    };

    // Skills Management
    public shared(msg) func addSkill(skill: Text) : async Result.Result<[Text], Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case null { #err("Profile not found") };
            case (?profile) {
                let skills = Buffer.fromArray<Text>(profile.skills);
                if (Buffer.contains<Text>(skills, skill, Text.equal)) {
                    #err("Skill already exists")
                } else {
                    skills.add(skill);
                    let updatedProfile: UserProfile = {
                        profile with 
                        skills = Buffer.toArray(skills);
                        updatedAt = getCurrentTime();
                    };
                    profiles.put(caller, updatedProfile);
                    #ok(updatedProfile.skills)
                }
            };
        }
    };

    public shared(msg) func removeSkill(skill: Text) : async Result.Result<[Text], Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case null { #err("Profile not found") };
            case (?profile) {
                let skills = Buffer.fromArray<Text>(profile.skills);
                let filteredSkills = Buffer.filter<Text>(
                    skills,
                    func(s) { s != skill }
                );
                
                let updatedProfile: UserProfile = {
                    profile with 
                    skills = Buffer.toArray(filteredSkills);
                    updatedAt = getCurrentTime();
                };
                
                profiles.put(caller, updatedProfile);
                #ok(updatedProfile.skills)
            };
        }
    };

    // File Management
    public shared(msg) func uploadFile(
        filename: Text,
        contentType: Text,
        size: Nat,
        url: Text,
        category: Text,
        tags: [Text]
    ) : async Result.Result<UserFile, Text> {
        let caller = msg.caller;
        let fileId = generateFileId();

        let file: UserFile = {
            id = fileId;
            filename = filename;
            contentType = contentType;
            size = size;
            url = url;
            category = category;
            uploadedAt = getCurrentTime();
            tags = tags;
        };

        userFiles.put(fileId, file);

        // Update user profile to include this file
        switch (profiles.get(caller)) {
            case (?profile) {
                let updatedFiles = Array.append(profile.files, [file]);
                let updatedProfile: UserProfile = {
                    profile with 
                    files = updatedFiles;
                    updatedAt = getCurrentTime();
                };
                profiles.put(caller, updatedProfile);
            };
            case null { /* Profile doesn't exist yet */ };
        };

        #ok(file)
    };

    public shared(msg) func linkFileToProfile(fileUrl: Text, category: Text) : async Result.Result<[UserFile], Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case null { #err("Profile not found") };
            case (?profile) {
                let fileId = generateFileId();
                let file: UserFile = {
                    id = fileId;
                    filename = "uploaded_file";
                    contentType = "unknown";
                    size = 0;
                    url = fileUrl;
                    category = category;
                    uploadedAt = getCurrentTime();
                    tags = [];
                };

                userFiles.put(fileId, file);
                let updatedFiles = Array.append(profile.files, [file]);
                
                let updatedProfile: UserProfile = {
                    profile with 
                    files = updatedFiles;
                    updatedAt = getCurrentTime();
                };
                profiles.put(caller, updatedProfile);
                #ok(updatedFiles)
            };
        }
    };

    public query(msg) func getMyFiles() : async [UserFile] {
        let caller = msg.caller;
        switch (profiles.get(caller)) {
            case (?profile) { profile.files };
            case null { [] };
        }
    };

    public query(msg) func getFilesByCategory(category: Text) : async [UserFile] {
        let caller = msg.caller;
        switch (profiles.get(caller)) {
            case (?profile) {
                Array.filter(profile.files, func(file: UserFile) : Bool {
                    file.category == category
                })
            };
            case null { [] };
        }
    };

    public shared(msg) func deleteFile(fileId: Text) : async Result.Result<Bool, Text> {
        let caller = msg.caller;
        
        switch (userFiles.get(fileId)) {
            case null { #err("File not found") };
            case (?file) {
                // Remove from userFiles
                userFiles.delete(fileId);
                
                // Remove from user profile
                switch (profiles.get(caller)) {
                    case (?profile) {
                        let updatedFiles = Array.filter(profile.files, func(f: UserFile) : Bool {
                            f.id != fileId
                        });
                        let updatedProfile: UserProfile = {
                            profile with 
                            files = updatedFiles;
                            updatedAt = getCurrentTime();
                        };
                        profiles.put(caller, updatedProfile);
                    };
                    case null { /* Profile doesn't exist */ };
                };
                
                #ok(true)
            };
        }
    };

    // Social Features - Using the implementation from earlier in the file that returns [SocialLink]

    // Analytics and Stats
    public query func getTotalUsers() : async Nat {
        profiles.size()
    };

    public query func getTotalXPDistributed() : async Int {
        var total: Int = 0;
        for ((_, transaction) in xpTransactions.entries()) {
            if (transaction.amount > 0) {
                total += transaction.amount;
            };
        };
        total
    };

    public query func getTopUsersByXP(limit: Nat) : async [UserProfile] {
        let allProfiles = Buffer.Buffer<UserProfile>(0);
        
        for ((_, profile) in profiles.entries()) {
            if (profile.settings.profileVisibility == "public") {
                allProfiles.add(profile);
            };
        };
        
        let sortedProfiles = Buffer.toArray(allProfiles);
        let sorted = Array.sort(sortedProfiles, func(a: UserProfile, b: UserProfile) : {#less; #equal; #greater} {
            if (a.xpBalance > b.xpBalance) { #less }
            else if (a.xpBalance < b.xpBalance) { #greater }
            else { #equal }
        });
        
        if (sorted.size() <= limit) {
            sorted
        } else {
            Array.tabulate(limit, func(i: Nat) : UserProfile {
                sorted[i]
            })
        }
    };

    // System upgrade hooks
    system func preupgrade() {
        profileEntries := profiles.entries() |> Iter.toArray(_);
        xpTransactionEntries := xpTransactions.entries() |> Iter.toArray(_);
        userFileEntries := userFiles.entries() |> Iter.toArray(_);
    };

    system func postupgrade() {
        profileEntries := [];
        xpTransactionEntries := [];
        userFileEntries := [];
    };

    // User self-service function to reset own XP
    public shared(msg) func resetUserXP() : async Result.Result<Bool, Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case null { #err("User profile not found") };
            case (?profile) {
                let updatedProfile: UserProfile = {
                    profile with 
                    xpBalance = 0;
                    updatedAt = getCurrentTime();
                };
                profiles.put(caller, updatedProfile);
                #ok(true)
            };
        }
    };

    // Function to get current user's XP balance
    public shared query(msg) func getMyXPBalance() : async Nat {
        switch (profiles.get(msg.caller)) {
            case (?profile) { profile.xpBalance };
            case null { 0 };
        }
    };

    public query func getCanisterStats() : async {
        totalUsers: Nat;
        totalTransactions: Nat;
        totalFiles: Nat;
        totalXPDistributed: Int;
    } {
        var totalXP: Int = 0;
        for ((_, transaction) in xpTransactions.entries()) {
            if (transaction.amount > 0) {
                totalXP += transaction.amount;
            };
        };

        {
            totalUsers = profiles.size();
            totalTransactions = xpTransactions.size();
            totalFiles = userFiles.size();
            totalXPDistributed = totalXP;
        }
    };
}
