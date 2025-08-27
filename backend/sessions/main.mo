import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Nat "mo:base/Nat";

actor Sessions {
    // Types
    public type SessionType = {
        #video;
        #voice;
    };

    public type SessionStatus = {
        #scheduled;
        #live;
        #completed;
        #cancelled;
    };

    public type Session = {
        id: Text;
        title: Text;
        description: Text;
        sessionType: SessionType;
        scheduledTime: Int;
        duration: Nat; // in minutes
        maxAttendees: Nat;
        host: Principal;
        hostName: Text;
        hostAvatar: Text;
        status: SessionStatus;
        attendees: [Principal];
        createdAt: Int;
        updatedAt: Int;
        recordingUrl: ?Text;
        meetingUrl: ?Text;
        tags: [Text];
    };

    public type CreateSessionInput = {
        title: Text;
        description: Text;
        sessionType: SessionType;
        scheduledTime: Int;
        duration: Nat;
        maxAttendees: Nat;
        hostName: Text;
        hostAvatar: Text;
        tags: [Text];
    };

    public type UpdateSessionInput = {
        id: Text;
        title: ?Text;
        description: ?Text;
        scheduledTime: ?Int;
        duration: ?Nat;
        maxAttendees: ?Nat;
        status: ?SessionStatus;
        recordingUrl: ?Text;
        meetingUrl: ?Text;
    };

    // State
    private stable var nextSessionId: Nat = 1;
    private var sessions = HashMap.HashMap<Text, Session>(10, Text.equal, Text.hash);
    private var userSessions = HashMap.HashMap<Principal, [Text]>(10, Principal.equal, Principal.hash);

    // Stable storage for upgrades
    private stable var sessionsEntries: [(Text, Session)] = [];
    private stable var userSessionsEntries: [(Principal, [Text])] = [];

    system func preupgrade() {
        sessionsEntries := Iter.toArray(sessions.entries());
        userSessionsEntries := Iter.toArray(userSessions.entries());
    };

    system func postupgrade() {
        sessions := HashMap.fromIter<Text, Session>(sessionsEntries.vals(), sessionsEntries.size(), Text.equal, Text.hash);
        userSessions := HashMap.fromIter<Principal, [Text]>(userSessionsEntries.vals(), userSessionsEntries.size(), Principal.equal, Principal.hash);
        sessionsEntries := [];
        userSessionsEntries := [];
    };

    // Helper functions
    private func generateSessionId(): Text {
        let id = "session_" # Nat.toText(nextSessionId);
        nextSessionId += 1;
        id
    };

    private func updateSessionStatus(session: Session) : Session {
        let now = Time.now();
        let sessionEndTime = session.scheduledTime + session.duration * 60_000_000_000; // Convert minutes to nanoseconds
        
        // Update status based on current time
        let newStatus = if (now < session.scheduledTime) {
            #scheduled
        } else if (now <= sessionEndTime) {
            #live
        } else {
            #completed
        };
        
        // Only update if status changed
        if (session.status != newStatus) {
            let updated = {
                session with
                status = newStatus;
                updatedAt = now;
            };
            sessions.put(session.id, updated);
            updated
        } else {
            session
        }
    };

    private func updateAllSessionsStatus() {
        for ((id, session) in sessions.entries()) {
            ignore updateSessionStatus(session);
        };
    };

    // Update a single session's status by ID and return it
    private func updateSessionStatusById(id: Text): ?Session {
        switch (sessions.get(id)) {
            case (?session) { ?updateSessionStatus(session) };
            case null { null };
        }
    };

    private func generateMeetingUrl(sessionType: SessionType, sessionId: Text): Text {
        let baseUrl = switch (sessionType) {
            case (#video) { "https://meet.jit.si/peerverse-video-" # sessionId };
            case (#voice) { "https://meet.jit.si/peerverse-voice-" # sessionId };
        };
        
        // Add authentication and security parameters
        let params = [
            "config.prejoinPageEnabled=false",
            "interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=true",
            "config.startWithAudioMuted=false",
            "config.startWithVideoMuted=false",
            "config.disableRemoteMute=true",
            "config.requireDisplayName=true",
            "config.enableNoisyMicDetection=false",
            "config.enableClosePage=true",
            "config.disableInviteFunctions=true",
            "config.enableWelcomePage=false",
            "config.enableUserRolesBasedOnToken=true"
        ];
        
        let queryParams = Text.join("&", params.vals());
        baseUrl # "?" # queryParams
    };

    private func addUserSession(user: Principal, sessionId: Text) {
        switch (userSessions.get(user)) {
            case (?existing) {
                let updated = Array.append(existing, [sessionId]);
                userSessions.put(user, updated);
            };
            case null {
                userSessions.put(user, [sessionId]);
            };
        }
    };

    // Public functions
    public shared(msg) func createSession(input: CreateSessionInput): async Result.Result<Session, Text> {
        let caller = msg.caller;
        
        // Validate input
        if (Text.size(input.title) == 0) {
            return #err("Title cannot be empty");
        };
        
        if (input.duration == 0) {
            return #err("Duration must be greater than 0");
        };
        
        if (input.maxAttendees == 0) {
            return #err("Max attendees must be greater than 0");
        };

        let sessionId = generateSessionId();
        let now = Time.now();
        let meetingUrl = generateMeetingUrl(input.sessionType, sessionId);
        
        let session: Session = {
            id = sessionId;
            title = input.title;
            description = input.description;
            sessionType = input.sessionType;
            scheduledTime = input.scheduledTime;
            duration = input.duration;
            maxAttendees = input.maxAttendees;
            host = caller;
            hostName = input.hostName;
            hostAvatar = input.hostAvatar;
            status = #scheduled;
            attendees = [];
            createdAt = now;
            updatedAt = now;
            recordingUrl = null;
            meetingUrl = ?meetingUrl;
            tags = input.tags;
        };

        sessions.put(sessionId, session);
        addUserSession(caller, sessionId);
        
        #ok(session)
    };

    public query func getAllSessions(): async [Session] {
        let allSessions = Iter.toArray(sessions.vals());
        Array.map<Session, Session>(allSessions, func(session) {
            updateSessionStatus(session)
        })
    };

    public query func getSession(id: Text): async ?Session {
        switch (sessions.get(id)) {
            case (?session) { ?updateSessionStatus(session) };
            case null { null };
        }
    };

    // Get session with updated status
    public shared(msg) func getSessionStatus(id: Text): async Result.Result<Session, Text> {
        switch (updateSessionStatusById(id)) {
            case (?session) { #ok(session) };
            case null { #err("Session not found") };
        }
    };

    public shared(msg) func getMySessions(): async [Session] {
        let caller = msg.caller;
        switch (userSessions.get(caller)) {
            case (?sessionIds) {
                let mySessions = Array.mapFilter<Text, Session>(sessionIds, func(id) {
                    sessions.get(id)
                });
                mySessions
            };
            case null { [] };
        }
    };

    public shared(msg) func joinSession(sessionId: Text): async Result.Result<Session, Text> {
        let caller = msg.caller;
        
        // First update the session status
        let updatedSession = switch (updateSessionStatusById(sessionId)) {
            case (?s) { s };
            case null { return #err("Session not found") };
        };
        
        // Check if session is already completed or cancelled
        switch (updatedSession.status) {
            case (#completed or #cancelled) {
                return #err("Cannot join a session that has been " # 
                    (if (updatedSession.status == #completed) "completed" else "cancelled"));
            };
            case _ {};
        };
        
        let now = Time.now();
        let startTime = updatedSession.scheduledTime;
        let endTime = startTime + updatedSession.duration * 60_000_000_000; // Convert minutes to nanoseconds
        let timeUntilStart = startTime - now;
        let timeUntilEnd = endTime - now;
        
        // Allow joining up to 15 minutes before start and until end time
        if (timeUntilStart > 15 * 60 * 1_000_000_000) {
            return #err("This session hasn't started yet. Please come back closer to the start time.");
        };
        
        if (timeUntilEnd <= 0) {
            return #err("This session has already ended.");
        };
                
        // Check if user is already in attendees
        if (Array.find<Principal>(updatedSession.attendees, func(p) { p == caller }) != null) {
            return #ok(updatedSession); // Already joined
        };
        
        // Check if there's space for more attendees
        if (updatedSession.attendees.size() >= updatedSession.maxAttendees) {
            return #err("This session is already at maximum capacity");
        };
        
        // Add user to attendees
        let finalSession = {
            updatedSession with
            attendees = Array.append<Principal>(updatedSession.attendees, [caller]);
            updatedAt = Time.now();
        };
        
        sessions.put(sessionId, finalSession);
        addUserSession(caller, sessionId);
        
        #ok(finalSession)
    };

    public shared(msg) func updateSession(input: UpdateSessionInput): async Result.Result<Session, Text> {
        let caller = msg.caller;
        
        switch (sessions.get(input.id)) {
            case (?session) {
                // Only host can update
                if (session.host != caller) {
                    return #err("Only the host can update this session");
                };
                
                let updatedSession: Session = {
                    session with
                    title = Option.get(input.title, session.title);
                    description = Option.get(input.description, session.description);
                    scheduledTime = Option.get(input.scheduledTime, session.scheduledTime);
                    duration = Option.get(input.duration, session.duration);
                    maxAttendees = Option.get(input.maxAttendees, session.maxAttendees);
                    status = Option.get(input.status, session.status);
                    recordingUrl = switch(input.recordingUrl) {
                        case (?url) { ?url };
                        case null { session.recordingUrl };
                    };
                    meetingUrl = switch(input.meetingUrl) {
                        case (?url) { ?url };
                        case null { session.meetingUrl };
                    };
                    updatedAt = Time.now();
                };
                
                sessions.put(input.id, updatedSession);
                #ok(updatedSession)
            };
            case null {
                #err("Session not found")
            };
        }
    };

    public shared(msg) func deleteSession(sessionId: Text): async Result.Result<Bool, Text> {
        let caller = msg.caller;
        
        switch (sessions.get(sessionId)) {
            case (?session) {
                // Only host can delete
                if (session.host != caller) {
                    return #err("Only the host can delete this session");
                };
                
                // Can only delete if not live
                if (session.status == #live) {
                    return #err("Cannot delete a live session");
                };
                
                sessions.delete(sessionId);
                #ok(true)
            };
            case null {
                #err("Session not found")
            };
        }
    };

    public query func getSessionsByStatus(status: SessionStatus): async [Session] {
        let allSessions = Iter.toArray(sessions.vals());
        Array.filter<Session>(allSessions, func(session) {
            session.status == status
        })
    };

    public query func getSessionsByType(sessionType: SessionType): async [Session] {
        let allSessions = Iter.toArray(sessions.vals());
        Array.filter<Session>(allSessions, func(session) {
            session.sessionType == sessionType
        })
    };

    // Periodically check and update session statuses
    system func heartbeat() : async () {
        updateAllSessionsStatus();
    };
}
