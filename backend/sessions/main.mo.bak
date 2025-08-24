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

    private func generateMeetingUrl(sessionType: SessionType, sessionId: Text): Text {
        switch (sessionType) {
            case (#video) { "https://meet.jit.si/peerverse-video-" # sessionId };
            case (#voice) { "https://meet.jit.si/peerverse-voice-" # sessionId };
        }
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
        Iter.toArray(sessions.vals())
    };

    public query func getSession(id: Text): async ?Session {
        sessions.get(id)
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
        
        switch (sessions.get(sessionId)) {
            case (?session) {
                // Check if session is joinable
                if (session.status != #scheduled and session.status != #live) {
                    return #err("Session is not available for joining");
                };
                
                // Check if already joined
                let alreadyJoined = Array.find<Principal>(session.attendees, func(p) { p == caller });
                if (Option.isSome(alreadyJoined)) {
                    return #ok(session);
                };
                
                // Check capacity
                if (session.attendees.size() >= session.maxAttendees) {
                    return #err("Session is full");
                };
                
                // Add attendee
                let updatedAttendees = Array.append(session.attendees, [caller]);
                let updatedSession = {
                    session with
                    attendees = updatedAttendees;
                    updatedAt = Time.now();
                };
                
                sessions.put(sessionId, updatedSession);
                addUserSession(caller, sessionId);
                
                #ok(updatedSession)
            };
            case null {
                #err("Session not found")
            };
        }
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

  
}
