"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.SessionsClient = exports.getSessionsClient = void 0;
var agent_1 = require("@dfinity/agent");
// IDL interface for the sessions canister
var sessionsIdl = function (_a) {
    var IDL = _a.IDL;
    var SessionType = IDL.Variant({
        video: IDL.Null,
        voice: IDL.Null,
        screen_share: IDL.Null,
        webinar: IDL.Null
    });
    var SessionStatus = IDL.Variant({
        scheduled: IDL.Null,
        live: IDL.Null,
        completed: IDL.Null,
        cancelled: IDL.Null,
        recording: IDL.Null
    });
    var RecordingStatus = IDL.Variant({
        not_started: IDL.Null,
        recording: IDL.Null,
        processing: IDL.Null,
        completed: IDL.Null,
        failed: IDL.Null
    });
    var RecordingInfo = IDL.Record({
        id: IDL.Text,
        sessionId: IDL.Text,
        startTime: IDL.Int,
        endTime: IDL.Opt(IDL.Int),
        duration: IDL.Opt(IDL.Nat),
        status: RecordingStatus,
        jibrilRecordingId: IDL.Opt(IDL.Text),
        recordingUrl: IDL.Opt(IDL.Text),
        thumbnailUrl: IDL.Opt(IDL.Text),
        fileSize: IDL.Opt(IDL.Nat),
        format: IDL.Text,
        quality: IDL.Text
    });
    var JitsiConfig = IDL.Record({
        roomName: IDL.Text,
        displayName: IDL.Text,
        email: IDL.Opt(IDL.Text),
        avatarUrl: IDL.Opt(IDL.Text),
        moderator: IDL.Bool,
        startWithAudioMuted: IDL.Bool,
        startWithVideoMuted: IDL.Bool,
        enableRecording: IDL.Bool,
        enableScreenSharing: IDL.Bool,
        enableChat: IDL.Bool,
        maxParticipants: IDL.Opt(IDL.Nat)
    });
    var Session = IDL.Record({
        id: IDL.Text,
        title: IDL.Text,
        description: IDL.Text,
        sessionType: SessionType,
        scheduledTime: IDL.Int,
        duration: IDL.Nat,
        maxAttendees: IDL.Nat,
        host: IDL.Principal,
        hostName: IDL.Text,
        hostAvatar: IDL.Text,
        status: SessionStatus,
        attendees: IDL.Vec(IDL.Principal),
        createdAt: IDL.Int,
        updatedAt: IDL.Int,
        recordingInfo: IDL.Opt(RecordingInfo),
        meetingUrl: IDL.Opt(IDL.Text),
        jitsiRoomName: IDL.Text,
        jitsiConfig: JitsiConfig,
        tags: IDL.Vec(IDL.Text),
        isRecordingEnabled: IDL.Bool,
        actualStartTime: IDL.Opt(IDL.Int),
        actualEndTime: IDL.Opt(IDL.Int),
        participantCount: IDL.Nat
    });
    var CreateSessionInput = IDL.Record({
        title: IDL.Text,
        description: IDL.Text,
        sessionType: SessionType,
        scheduledTime: IDL.Int,
        duration: IDL.Nat,
        maxAttendees: IDL.Nat,
        hostName: IDL.Text,
        hostAvatar: IDL.Text,
        tags: IDL.Vec(IDL.Text),
        isRecordingEnabled: IDL.Bool,
        jitsiConfig: IDL.Opt(JitsiConfig)
    });
    var UpdateSessionInput = IDL.Record({
        id: IDL.Text,
        title: IDL.Opt(IDL.Text),
        description: IDL.Opt(IDL.Text),
        scheduledTime: IDL.Opt(IDL.Int),
        duration: IDL.Opt(IDL.Nat),
        maxAttendees: IDL.Opt(IDL.Nat),
        status: IDL.Opt(SessionStatus),
        recordingInfo: IDL.Opt(RecordingInfo),
        meetingUrl: IDL.Opt(IDL.Text),
        isRecordingEnabled: IDL.Opt(IDL.Bool),
        actualStartTime: IDL.Opt(IDL.Int),
        actualEndTime: IDL.Opt(IDL.Int)
    });
    var StartRecordingInput = IDL.Record({
        sessionId: IDL.Text,
        jibrilConfig: IDL.Record({
            quality: IDL.Text,
            format: IDL.Text,
            includeAudio: IDL.Bool,
            includeVideo: IDL.Bool,
            includeScreenShare: IDL.Bool
        })
    });
    var Result = function (T, E) { return IDL.Variant({ ok: T, err: E }); };
    return IDL.Service({
        createSession: IDL.Func([CreateSessionInput], [Result(Session, IDL.Text)], []),
        getAllSessions: IDL.Func([], [IDL.Vec(Session)], ['query']),
        getSession: IDL.Func([IDL.Text], [IDL.Opt(Session)], ['query']),
        getSessionStatus: IDL.Func([IDL.Text], [Result(Session, IDL.Text)], []),
        getMySessions: IDL.Func([], [IDL.Vec(Session)], []),
        joinSession: IDL.Func([IDL.Text], [Result(Session, IDL.Text)], []),
        leaveSession: IDL.Func([IDL.Text], [Result(Session, IDL.Text)], []),
        updateSession: IDL.Func([UpdateSessionInput], [Result(Session, IDL.Text)], []),
        deleteSession: IDL.Func([IDL.Text], [Result(IDL.Bool, IDL.Text)], []),
        startRecording: IDL.Func([StartRecordingInput], [Result(RecordingInfo, IDL.Text)], []),
        stopRecording: IDL.Func([IDL.Text], [Result(RecordingInfo, IDL.Text)], []),
        updateRecordingStatus: IDL.Func([
            IDL.Text,
            RecordingStatus,
            IDL.Opt(IDL.Text),
            IDL.Opt(IDL.Text),
            IDL.Opt(IDL.Text),
            IDL.Opt(IDL.Nat)
        ], [Result(RecordingInfo, IDL.Text)], []),
        getSessionRecordings: IDL.Func([IDL.Text], [IDL.Vec(RecordingInfo)], ['query']),
        getRecording: IDL.Func([IDL.Text], [IDL.Opt(RecordingInfo)], ['query']),
        getAllRecordings: IDL.Func([], [IDL.Vec(RecordingInfo)], ['query']),
        getMyRecordings: IDL.Func([], [IDL.Vec(RecordingInfo)], []),
        getSessionsByStatus: IDL.Func([SessionStatus], [IDL.Vec(Session)], ['query']),
        getSessionsByType: IDL.Func([SessionType], [IDL.Vec(Session)], ['query']),
        getUpcomingSessions: IDL.Func([], [IDL.Vec(Session)], ['query']),
        getLiveSessions: IDL.Func([], [IDL.Vec(Session)], ['query'])
    });
};
var SessionsClient = /** @class */ (function () {
    function SessionsClient(canisterId, agent) {
        this.agent = agent || new agent_1.HttpAgent({
            host: 'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io'
        });
        this.actor = agent_1.Actor.createActor(sessionsIdl, {
            agent: this.agent,
            canisterId: canisterId
        });
    }
    SessionsClient.prototype.createSession = function (input) {
        return __awaiter(this, void 0, Promise, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.createSession(input)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error creating session:', error_1);
                        return [2 /*return*/, { err: 'Failed to create session' }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.getAllSessions = function () {
        return __awaiter(this, void 0, Promise, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.getAllSessions()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error getting all sessions:', error_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.getSession = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.getSession(id)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0 ? result[0] : null];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error getting session:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.getSessionStatus = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.getSessionStatus(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Error getting session status:', error_4);
                        return [2 /*return*/, { err: 'Failed to get session status' }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.getMySessions = function () {
        return __awaiter(this, void 0, Promise, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.getMySessions()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error getting my sessions:', error_5);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.joinSession = function (sessionId) {
        return __awaiter(this, void 0, Promise, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.joinSession(sessionId)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error joining session:', error_6);
                        return [2 /*return*/, { err: 'Failed to join session' }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.leaveSession = function (sessionId) {
        return __awaiter(this, void 0, Promise, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.leaveSession(sessionId)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Error leaving session:', error_7);
                        return [2 /*return*/, { err: 'Failed to leave session' }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.updateSession = function (input) {
        return __awaiter(this, void 0, Promise, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.updateSession(input)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Error updating session:', error_8);
                        return [2 /*return*/, { err: 'Failed to update session' }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.deleteSession = function (sessionId) {
        return __awaiter(this, void 0, Promise, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.deleteSession(sessionId)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_9 = _a.sent();
                        console.error('Error deleting session:', error_9);
                        return [2 /*return*/, { err: 'Failed to delete session' }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.startRecording = function (input) {
        return __awaiter(this, void 0, Promise, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.startRecording(input)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_10 = _a.sent();
                        console.error('Error starting recording:', error_10);
                        return [2 /*return*/, { err: 'Failed to start recording' }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.stopRecording = function (sessionId) {
        return __awaiter(this, void 0, Promise, function () {
            var error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.stopRecording(sessionId)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_11 = _a.sent();
                        console.error('Error stopping recording:', error_11);
                        return [2 /*return*/, { err: 'Failed to stop recording' }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.updateRecordingStatus = function (recordingId, status, jibrilRecordingId, recordingUrl, thumbnailUrl, fileSize) {
        return __awaiter(this, void 0, Promise, function () {
            var error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.updateRecordingStatus(recordingId, status, jibrilRecordingId ? [jibrilRecordingId] : [], recordingUrl ? [recordingUrl] : [], thumbnailUrl ? [thumbnailUrl] : [], fileSize ? [fileSize] : [])];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_12 = _a.sent();
                        console.error('Error updating recording status:', error_12);
                        return [2 /*return*/, { err: 'Failed to update recording status' }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.getSessionRecordings = function (sessionId) {
        return __awaiter(this, void 0, Promise, function () {
            var error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.getSessionRecordings(sessionId)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_13 = _a.sent();
                        console.error('Error getting session recordings:', error_13);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.getRecording = function (recordingId) {
        return __awaiter(this, void 0, Promise, function () {
            var result, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.getRecording(recordingId)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0 ? result[0] : null];
                    case 2:
                        error_14 = _a.sent();
                        console.error('Error getting recording:', error_14);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.getAllRecordings = function () {
        return __awaiter(this, void 0, Promise, function () {
            var error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.getAllRecordings()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_15 = _a.sent();
                        console.error('Error getting all recordings:', error_15);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.getMyRecordings = function () {
        return __awaiter(this, void 0, Promise, function () {
            var error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.getMyRecordings()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_16 = _a.sent();
                        console.error('Error getting my recordings:', error_16);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.getSessionsByStatus = function (status) {
        return __awaiter(this, void 0, Promise, function () {
            var error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.getSessionsByStatus(status)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_17 = _a.sent();
                        console.error('Error getting sessions by status:', error_17);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.getSessionsByType = function (sessionType) {
        return __awaiter(this, void 0, Promise, function () {
            var error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.getSessionsByType(sessionType)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_18 = _a.sent();
                        console.error('Error getting sessions by type:', error_18);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.getUpcomingSessions = function () {
        return __awaiter(this, void 0, Promise, function () {
            var error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.getUpcomingSessions()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_19 = _a.sent();
                        console.error('Error getting upcoming sessions:', error_19);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionsClient.prototype.getLiveSessions = function () {
        return __awaiter(this, void 0, Promise, function () {
            var error_20;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.actor.getLiveSessions()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_20 = _a.sent();
                        console.error('Error getting live sessions:', error_20);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Utility methods
    SessionsClient.prototype.getSessionTypeLabel = function (sessionType) {
        if ('video' in sessionType)
            return 'Video Call';
        if ('voice' in sessionType)
            return 'Voice Call';
        if ('screen_share' in sessionType)
            return 'Screen Share';
        if ('webinar' in sessionType)
            return 'Webinar';
        return 'Unknown';
    };
    SessionsClient.prototype.getSessionStatusLabel = function (status) {
        if ('scheduled' in status)
            return 'Scheduled';
        if ('live' in status)
            return 'Live';
        if ('completed' in status)
            return 'Completed';
        if ('cancelled' in status)
            return 'Cancelled';
        if ('recording' in status)
            return 'Recording';
        return 'Unknown';
    };
    SessionsClient.prototype.getRecordingStatusLabel = function (status) {
        if ('not_started' in status)
            return 'Not Started';
        if ('recording' in status)
            return 'Recording';
        if ('processing' in status)
            return 'Processing';
        if ('completed' in status)
            return 'Completed';
        if ('failed' in status)
            return 'Failed';
        return 'Unknown';
    };
    SessionsClient.prototype.formatDuration = function (minutes) {
        var mins = Number(minutes);
        var hours = Math.floor(mins / 60);
        var remainingMins = mins % 60;
        if (hours > 0) {
            return hours + "h " + remainingMins + "m";
        }
        return remainingMins + "m";
    };
    SessionsClient.prototype.formatDateTime = function (timestamp) {
        // Convert nanoseconds to milliseconds for JavaScript Date
        var milliseconds = Number(timestamp) / 1000000;
        var date = new Date(milliseconds);
        // Format the date and time in a user-friendly way
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };
    SessionsClient.prototype.isSessionLive = function (session) {
        return 'live' in session.status || 'recording' in session.status;
    };
    SessionsClient.prototype.canJoinSession = function (session) {
        try {
            var nowNs = BigInt(Date.now()) * 1000000n; // Current time in nanoseconds
            var startTimeNs = session.scheduledTime;
            var durationNs = BigInt(session.duration) * 60n * 1000000000n; // Convert minutes to nanoseconds
            var endTimeNs = startTimeNs + durationNs;
            var timeUntilStartNs = startTimeNs - nowNs;
            var timeUntilEndNs = endTimeNs - nowNs;
            var fifteenMinutesNs = 15n * 60n * 1000000000n; // 15 minutes in nanoseconds
            // Can join 15 minutes before start and until end time
            return timeUntilStartNs <= fifteenMinutesNs && timeUntilEndNs > 0n;
        }
        catch (error) {
            console.error('Error in canJoinSession:', error);
            return false;
        }
    };
    return SessionsClient;
}());
exports.SessionsClient = SessionsClient;
// Create singleton instance
var sessionsClient = null;
exports.getSessionsClient = function (canisterId) {
    if (!sessionsClient && canisterId) {
        sessionsClient = new SessionsClient(canisterId);
    }
    if (!sessionsClient) {
        throw new Error('Sessions client not initialized. Please provide canister ID.');
    }
    return sessionsClient;
};
exports["default"] = SessionsClient;
