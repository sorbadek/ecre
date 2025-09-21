import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";

persistent actor Sessions {
    // Types
    public type SessionType = {
        #video;
        #voice;
        #screen_share;
        #webinar;
    };

    public type SessionStatus = {
        #scheduled;
        #live;
        #completed;
        #cancelled;
        #recording;
    };

    public type RecordingStatus = {
        #not_started;
        #recording;
        #processing;
        #completed;
        #failed;
    };

    public type RecordingInfo = {
        id: Text;
        sessionId: Text;
        startTime: Int;
        endTime: ?Int;
        duration: ?Nat; // in seconds
        status: RecordingStatus;
        jibrilRecordingId: ?Text;
        recordingUrl: ?Text;
        thumbnailUrl: ?Text;
        fileSize: ?Nat; // in bytes
        format: Text; // "mp4", "webm", etc.
        quality: Text; // "720p", "1080p", etc.
    };

    public type JitsiConfig = {
        roomName: Text;
        displayName: Text;
        email: ?Text;
        avatarUrl: ?Text;
        moderator: Bool;
        startWithAudioMuted: Bool;
        startWithVideoMuted: Bool;
        enableRecording: Bool;
        enableScreenSharing: Bool;
        enableChat: Bool;
        maxParticipants: ?Nat;
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
        recordingInfo: ?RecordingInfo;
        meetingUrl: ?Text;
        jitsiRoomName: Text;
        jitsiConfig: JitsiConfig;
        tags: [Text];
        isRecordingEnabled: Bool;
        actualStartTime: ?Int;
        actualEndTime: ?Int;
        participantCount: Nat;
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
        isRecordingEnabled: Bool;
        jitsiConfig: ?JitsiConfig;
    };

    public type UpdateSessionInput = {
        id: Text;
        title: ?Text;
        description: ?Text;
        scheduledTime: ?Int;
        duration: ?Nat;
        maxAttendees: ?Nat;
        status: ?SessionStatus;
        recordingInfo: ?RecordingInfo;
        meetingUrl: ?Text;
        isRecordingEnabled: ?Bool;
        actualStartTime: ?Int;
        actualEndTime: ?Int;
    };

    public type StartRecordingInput = {
        sessionId: Text;
        jibrilConfig: {
            quality: Text; // "720p", "1080p"
            format: Text; // "mp4", "webm"
            includeAudio: Bool;
            includeVideo: Bool;
            includeScreenShare: Bool;
        };
    };

    // State
    private stable var nextSessionId: Nat = 1;
    private stable var nextRecordingId: Nat = 1;
    private transient var sessions = HashMap.HashMap<Text, Session>(10, Text.equal, Text.hash);
    private transient var userSessions = HashMap.HashMap<Principal, [Text]>(10, Principal.equal, Principal.hash);
    private transient var recordings = HashMap.HashMap<Text, RecordingInfo>(10, Text.equal, Text.hash);
    private transient var sessionRecordings = HashMap.HashMap<Text, [Text]>(10, Text.equal, Text.hash); // sessionId -> recordingIds

    // Stable storage for upgrades
    private stable var sessionsEntries: [(Text, Session)] = [];
    private stable var userSessionsEntries: [(Principal, [Text])] = [];
    private stable var recordingsEntries: [(Text, RecordingInfo)] = [];
    private stable var sessionRecordingsEntries: [(Text, [Text])] = [];

    system func preupgrade() {
        sessionsEntries := Iter.toArray(sessions.entries());
        userSessionsEntries := Iter.toArray(userSessions.entries());
        recordingsEntries := Iter.toArray(recordings.entries());
        sessionRecordingsEntries := Iter.toArray(sessionRecordings.entries());
    };

    system func postupgrade() {
        sessions := HashMap.fromIter<Text, Session>(sessionsEntries.vals(), sessionsEntries.size(), Text.equal, Text.hash);
        userSessions := HashMap.fromIter<Principal, [Text]>(userSessionsEntries.vals(), userSessionsEntries.size(), Principal.equal, Principal.hash);
        recordings := HashMap.fromIter<Text, RecordingInfo>(recordingsEntries.vals(), recordingsEntries.size(), Text.equal, Text.hash);
        sessionRecordings := HashMap.fromIter<Text, [Text]>(sessionRecordingsEntries.vals(), sessionRecordingsEntries.size(), Text.equal, Text.hash);
        sessionsEntries := [];
        userSessionsEntries := [];
        recordingsEntries := [];
        sessionRecordingsEntries := [];
    };

    // Helper functions
    private func generateSessionId(): Text {
        let id = "session_" # Nat.toText(nextSessionId);
        nextSessionId += 1;
        id
    };

    private func generateRecordingId(): Text {
        let id = "recording_" # Nat.toText(nextRecordingId);
        nextRecordingId += 1;
        id
    };

    private func generateJitsiRoomName(sessionId: Text, sessionType: SessionType): Text {
        let typePrefix = switch (sessionType) {
            case (#video) { "video" };
            case (#voice) { "voice" };
            case (#screen_share) { "screen" };
            case (#webinar) { "webinar" };
        };
        "peerverse-" # typePrefix # "-" # sessionId
    };

    private func createDefaultJitsiConfig(sessionType: SessionType, isHost: Bool, hostName: Text): JitsiConfig {
        {
            roomName = "";
            displayName = hostName;
            email = null;
            avatarUrl = null;
            moderator = isHost;
            startWithAudioMuted = false;
            startWithVideoMuted = sessionType == #voice;
            enableRecording = true;
            enableScreenSharing = sessionType == #screen_share or sessionType == #webinar;
            enableChat = true;
            maxParticipants = null;
        }
    };

    private func generateMeetingUrl(sessionType: SessionType, roomName: Text, config: JitsiConfig): Text {
        let baseUrl = "https://meet.jit.si/" # roomName;
        
        let params = Buffer.Buffer<Text>(10);
        params.add("config.prejoinPageEnabled=false");
        params.add("interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=true");
        params.add("config.startWithAudioMuted=" # (if (config.startWithAudioMuted) "true" else "false"));
        params.add("config.startWithVideoMuted=" # (if (config.startWithVideoMuted) "true" else "false"));
        params.add("config.disableRemoteMute=false");
        params.add("config.requireDisplayName=true");
        params.add("config.enableNoisyMicDetection=true");
        params.add("config.enableClosePage=true");
        params.add("config.disableInviteFunctions=false");
        params.add("config.enableWelcomePage=false");
        params.add("config.enableUserRolesBasedOnToken=true");
        
        if (config.enableRecording) {
            params.add("config.fileRecordingsEnabled=true");
            params.add("config.dropbox.appKey=YOUR_DROPBOX_APP_KEY");
        };
        
        if (config.enableScreenSharing) {
            params.add("config.desktopSharingFrameRate.min=5");
            params.add("config.desktopSharingFrameRate.max=30");
        };
        
        switch (config.maxParticipants) {
            case (?max) { params.add("config.maxParticipants=" # Nat.toText(max)) };
            case null {};
        };
        
        let queryParams = Text.join("&", Buffer.toArray(params).vals());
        baseUrl # "?" # queryParams
    };

    private func updateSessionStatus(session: Session) : Session {
        let now = Time.now();
        let sessionEndTime = session.scheduledTime + session.duration * 60_000_000_000;
        
        let newStatus = if (now < session.scheduledTime) {
            #scheduled
        } else if (now <= sessionEndTime) {
            #live
        } else {
            #completed
        };
        
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

    private func updateSessionStatusById(id: Text): ?Session {
        switch (sessions.get(id)) {
            case (?session) { ?updateSessionStatus(session) };
            case null { null };
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

    private func addSessionRecording(sessionId: Text, recordingId: Text) {
        switch (sessionRecordings.get(sessionId)) {
            case (?existing) {
                let updated = Array.append(existing, [recordingId]);
                sessionRecordings.put(sessionId, updated);
            };
            case null {
                sessionRecordings.put(sessionId, [recordingId]);
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
        let roomName = generateJitsiRoomName(sessionId, input.sessionType);
        
        let jitsiConfig = switch (input.jitsiConfig) {
            case (?config) { { config with roomName = roomName } };
            case null { 
                let defaultConfig = createDefaultJitsiConfig(input.sessionType, true, input.hostName);
                { defaultConfig with roomName = roomName }
            };
        };
        
        let meetingUrl = generateMeetingUrl(input.sessionType, roomName, jitsiConfig);
        
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
            recordingInfo = null;
            meetingUrl = ?meetingUrl;
            jitsiRoomName = roomName;
            jitsiConfig = jitsiConfig;
            tags = input.tags;
            isRecordingEnabled = input.isRecordingEnabled;
            actualStartTime = null;
            actualEndTime = null;
            participantCount = 0;
        };

        sessions.put(sessionId, session);
        addUserSession(caller, sessionId);
        
        #ok(session)
    };

    public shared(msg) func startRecording(input: StartRecordingInput): async Result.Result<RecordingInfo, Text> {
        let caller = msg.caller;
        
        switch (sessions.get(input.sessionId)) {
            case (?session) {
                // Only host can start recording
                if (session.host != caller) {
                    return #err("Only the host can start recording");
                };
                
                // Check if session is live
                if (session.status != #live) {
                    return #err("Can only start recording during a live session");
                };
                
                // Check if recording is enabled for this session
                if (not session.isRecordingEnabled) {
                    return #err("Recording is not enabled for this session");
                };
                
                // Check if already recording
                switch (session.recordingInfo) {
                    case (?existing) {
                        if (existing.status == #recording) {
                            return #err("Recording is already in progress");
                        };
                    };
                    case null {};
                };
                
                let recordingId = generateRecordingId();
                let now = Time.now();
                
                let recordingInfo: RecordingInfo = {
                    id = recordingId;
                    sessionId = input.sessionId;
                    startTime = now;
                    endTime = null;
                    duration = null;
                    status = #recording;
                    jibrilRecordingId = null; // Will be set by Jibril integration
                    recordingUrl = null;
                    thumbnailUrl = null;
                    fileSize = null;
                    format = input.jibrilConfig.format;
                    quality = input.jibrilConfig.quality;
                };
                
                recordings.put(recordingId, recordingInfo);
                addSessionRecording(input.sessionId, recordingId);
                
                // Update session with recording info and status
                let updatedSession = {
                    session with
                    recordingInfo = ?recordingInfo;
                    status = #recording;
                    updatedAt = now;
                };
                sessions.put(input.sessionId, updatedSession);
                
                #ok(recordingInfo)
            };
            case null {
                #err("Session not found")
            };
        }
    };

    public shared(msg) func stopRecording(sessionId: Text): async Result.Result<RecordingInfo, Text> {
        let caller = msg.caller;
        
        switch (sessions.get(sessionId)) {
            case (?session) {
                // Only host can stop recording
                if (session.host != caller) {
                    return #err("Only the host can stop recording");
                };
                
                switch (session.recordingInfo) {
                    case (?recordingInfo) {
                        if (recordingInfo.status != #recording) {
                            return #err("No active recording to stop");
                        };
                        
                        let now = Time.now();
                        let duration = (now - recordingInfo.startTime) / 1_000_000_000; // Convert to seconds
                        
                        let updatedRecording = {
                            recordingInfo with
                            endTime = ?now;
                            duration = ?Int.abs(duration);
                            status = #processing;
                        };
                        
                        recordings.put(recordingInfo.id, updatedRecording);
                        
                        // Update session
                        let updatedSession = {
                            session with
                            recordingInfo = ?updatedRecording;
                            status = #live; // Back to live status
                            updatedAt = now;
                        };
                        sessions.put(sessionId, updatedSession);
                        
                        #ok(updatedRecording)
                    };
                    case null {
                        #err("No recording found for this session")
                    };
                }
            };
            case null {
                #err("Session not found")
            };
        }
    };

    public shared(msg) func updateRecordingStatus(
        recordingId: Text, 
        status: RecordingStatus, 
        jibrilRecordingId: ?Text,
        recordingUrl: ?Text,
        thumbnailUrl: ?Text,
        fileSize: ?Nat
    ): async Result.Result<RecordingInfo, Text> {
        switch (recordings.get(recordingId)) {
            case (?recording) {
                let updatedRecording = {
                    recording with
                    status = status;
                    jibrilRecordingId = switch(jibrilRecordingId) {
                        case (?id) { ?id };
                        case null { recording.jibrilRecordingId };
                    };
                    recordingUrl = switch(recordingUrl) {
                        case (?url) { ?url };
                        case null { recording.recordingUrl };
                    };
                    thumbnailUrl = switch(thumbnailUrl) {
                        case (?url) { ?url };
                        case null { recording.thumbnailUrl };
                    };
                    fileSize = switch(fileSize) {
                        case (?size) { ?size };
                        case null { recording.fileSize };
                    };
                };
                
                recordings.put(recordingId, updatedRecording);
                
                // Update session with new recording info
                switch (sessions.get(recording.sessionId)) {
                    case (?session) {
                        let updatedSession = {
                            session with
                            recordingInfo = ?updatedRecording;
                            updatedAt = Time.now();
                        };
                        sessions.put(recording.sessionId, updatedSession);
                    };
                    case null {};
                };
                
                #ok(updatedRecording)
            };
            case null {
                #err("Recording not found")
            };
        }
    };

    public shared(msg) func joinSession(sessionId: Text): async Result.Result<{session: Session; isModerator: Bool}, Text> {
        let caller = msg.caller;
        
        let updatedSession = switch (updateSessionStatusById(sessionId)) {
            case (?s) { s };
            case null { return #err("Session not found") };
        };
        
        // Check if user is the host (moderator)
        let isModerator = updatedSession.host == caller;
        
        switch (updatedSession.status) {
            case (#completed or #cancelled) {
                return #err("Cannot join a session that has been " # 
                    (if (updatedSession.status == #completed) "completed" else "cancelled"));
            };
            case _ {};
        };
        
        let now = Time.now();
        let startTime = updatedSession.scheduledTime;
        let endTime = startTime + updatedSession.duration * 60_000_000_000;
        let timeUntilStart = startTime - now;
        let timeUntilEnd = endTime - now;
        
        if (timeUntilStart > 15 * 60 * 1_000_000_000) {
            return #err("This session hasn't started yet. Please come back closer to the start time.");
        };
        
        if (timeUntilEnd <= 0) {
            return #err("This session has already ended.");
        };
                
        if (Array.find<Principal>(updatedSession.attendees, func(p) { p == caller }) != null) {
            return #ok({
                session = updatedSession;
                isModerator = updatedSession.host == caller;
            });
        };
        
        if (updatedSession.attendees.size() >= updatedSession.maxAttendees) {
            return #err("This session is already at maximum capacity");
        };
        
        let finalSession = {
            updatedSession with
            attendees = Array.append<Principal>(updatedSession.attendees, [caller]);
            participantCount = updatedSession.participantCount + 1;
            actualStartTime = switch(updatedSession.actualStartTime) {
                case (?time) { ?time };
                case null { ?now };
            };
            updatedAt = Time.now();
        };
        
        sessions.put(sessionId, finalSession);
        addUserSession(caller, sessionId);
        
        #ok({
            session = finalSession;
            isModerator = finalSession.host == caller;
        });
    };

    public shared(msg) func leaveSession(sessionId: Text): async Result.Result<Session, Text> {
        let caller = msg.caller;
        
        switch (sessions.get(sessionId)) {
            case (?session) {
                let attendees = Array.filter<Principal>(session.attendees, func(p) { p != caller });
                let participantCount = if (session.participantCount > 0) { session.participantCount - 1 } else { 0 };
                
                let updatedSession = {
                    session with
                    attendees = attendees;
                    participantCount = participantCount;
                    updatedAt = Time.now();
                };
                
                sessions.put(sessionId, updatedSession);
                #ok(updatedSession)
            };
            case null {
                #err("Session not found")
            };
        }
    };

    public query func getSessionRecordings(sessionId: Text): async [RecordingInfo] {
        switch (sessionRecordings.get(sessionId)) {
            case (?recordingIds) {
                let recordingsBuffer = Buffer.Buffer<RecordingInfo>(recordingIds.size());
                for (recordingId in recordingIds.vals()) {
                    switch (recordings.get(recordingId)) {
                        case (?recording) { recordingsBuffer.add(recording) };
                        case null {};
                    };
                };
                Buffer.toArray(recordingsBuffer)
            };
            case null { [] };
        }
    };

    public query func getRecording(recordingId: Text): async ?RecordingInfo {
        recordings.get(recordingId)
    };

    public query func getAllRecordings(): async [RecordingInfo] {
        Iter.toArray(recordings.vals())
    };

    public shared(msg) func getMyRecordings(): async [RecordingInfo] {
        let caller = msg.caller;
        let myRecordings = Buffer.Buffer<RecordingInfo>(0);
        
        // Get all sessions hosted by the user
        for ((_, session) in sessions.entries()) {
            if (session.host == caller) {
                let sessionRecordings = await getSessionRecordings(session.id);
                for (recording in sessionRecordings.vals()) {
                    myRecordings.add(recording);
                };
            };
        };
        
        Buffer.toArray(myRecordings)
    };

    public query func getAllSessions(): async [Session] {
        let allSessions = Iter.toArray(sessions.vals());
        Array.map<Session, Session>(allSessions, func(session) {
            let updated = updateSessionStatus(session);
            // Ensure the host field is properly serialized
            {
                updated with host = updated.host
            }
        })
    };

    public query func getSession(id: Text): async ?Session {
        switch (sessions.get(id)) {
            case (?session) { 
                let updated = updateSessionStatus(session);
                // Ensure the host field is properly serialized
                ?{ updated with host = updated.host }
            };
            case null { null };
        }
    };

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
                    switch (sessions.get(id)) {
                        case (?session) { 
                            let updated = updateSessionStatus(session);
                            // Ensure the host field is properly serialized
                            ?{ updated with host = updated.host }
                        };
                        case null { null };
                    }
                });
                mySessions
            };
            case null { [] };
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
                    recordingInfo = switch(input.recordingInfo) {
                        case (?info) { ?info };
                        case null { session.recordingInfo };
                    };
                    meetingUrl = switch(input.meetingUrl) {
                        case (?url) { ?url };
                        case null { session.meetingUrl };
                    };
                    isRecordingEnabled = Option.get(input.isRecordingEnabled, session.isRecordingEnabled);
                    actualStartTime = switch(input.actualStartTime) {
                        case (?time) { ?time };
                        case null { session.actualStartTime };
                    };
                    actualEndTime = switch(input.actualEndTime) {
                        case (?time) { ?time };
                        case null { session.actualEndTime };
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
                
                // Can only delete if not live or recording
                if (session.status == #live or session.status == #recording) {
                    return #err("Cannot delete a live or recording session");
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

    public query func getUpcomingSessions(): async [Session] {
        let now = Time.now();
        let allSessions = Iter.toArray(sessions.vals());
        Array.filter<Session>(allSessions, func(session) {
            session.scheduledTime > now and session.status == #scheduled
        })
    };

    public query func getLiveSessions(): async [Session] {
        let allSessions = Iter.toArray(sessions.vals());
        Array.filter<Session>(allSessions, func(session) {
            session.status == #live or session.status == #recording
        })
    };

    // Periodically check and update session statuses
    system func heartbeat() : async () {
        updateAllSessionsStatus();
        
        // Auto-end sessions that have exceeded their scheduled duration
        let now = Time.now();
        for ((id, session) in sessions.entries()) {
            if (session.status == #live or session.status == #recording) {
                let endTime = session.scheduledTime + session.duration * 60_000_000_000;
                if (now > endTime) {
                    let updatedSession = {
                        session with
                        status = #completed;
                        actualEndTime = ?now;
                        updatedAt = now;
                    };
                    sessions.put(id, updatedSession);
                    
                    // Stop any active recording
                    switch (session.recordingInfo) {
                        case (?recordingInfo) {
                            if (recordingInfo.status == #recording) {
                                let duration = (now - recordingInfo.startTime) / 1_000_000_000;
                                let updatedRecording = {
                                    recordingInfo with
                                    endTime = ?now;
                                    duration = ?Int.abs(duration);
                                    status = #processing;
                                };
                                recordings.put(recordingInfo.id, updatedRecording);
                            };
                        };
                        case null {};
                    };
                };
            };
        };
    };
}
