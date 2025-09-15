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
exports.sessionClient = exports.SessionClient = void 0;
var agent_1 = require("@dfinity/agent");
var auth_client_1 = require("@dfinity/auth-client");
var sessions_idl_1 = require("./ic/sessions.idl");
// Constants
// Get canister ID from environment variable or use default
var DEFAULT_SESSIONS_CANISTER_ID = "e6lpp-6iaaa-aaaaa-qajnq-cai";
var SESSIONS_CANISTER_ID = process.env.NEXT_PUBLIC_SESSIONS_CANISTER_ID || DEFAULT_SESSIONS_CANISTER_ID;
// Use the IC replica directly
var PRODUCTION_HOST = "https://a4gq6-oaaaa-aaaab-qaa4q-cai.icp0.io";
// API proxy endpoint
var API_PROXY_ENDPOINT = "/api/ic-proxy";
console.log('[SessionClient] Using canister ID:', SESSIONS_CANISTER_ID);
// CORS configuration for local development
var CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};
// Force production mode to use the IC network
var isLocal = false;
// Configure host based on environment
var HOST = PRODUCTION_HOST;
// Log environment info
console.log("[SessionClient] Initialized in " + (isLocal ? 'local' : 'production') + " mode");
console.log("[SessionClient] Using host: " + HOST);
// Format error messages consistently
var formatError = function (error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (typeof error === 'object' && error !== null) {
        return JSON.stringify(error);
    }
    return 'Unknown error';
};
// Helper to fetch root key for local development
var fetchRootKey = function (agent) { return __awaiter(void 0, void 0, Promise, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!isLocal)
                    return [2 /*return*/, false];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                console.log('[SessionClient] Fetching root key for local development...');
                return [4 /*yield*/, agent.fetchRootKey()];
            case 2:
                _a.sent();
                console.log('[SessionClient] Successfully fetched root key');
                return [2 /*return*/, true];
            case 3:
                error_1 = _a.sent();
                console.warn('[SessionClient] Could not fetch root key, continuing without it:', error_1);
                return [2 /*return*/, false];
            case 4: return [2 /*return*/];
        }
    });
}); };
var SessionClient = /** @class */ (function () {
    function SessionClient() {
        this.actor = null;
        this.authClient = null;
        this.currentIdentity = null;
        this.isInitialized = false;
    }
    SessionClient.getInstance = function () {
        if (!SessionClient.instance) {
            SessionClient.instance = new SessionClient();
        }
        return SessionClient.instance;
    };
    SessionClient.prototype.getAuthClient = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.authClient) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, auth_client_1.AuthClient.create({
                                idleOptions: { disableIdle: true }
                            })];
                    case 1:
                        _a.authClient = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.authClient];
                }
            });
        });
    };
    SessionClient.prototype.setIdentity = function (identity) {
        this.currentIdentity = identity;
        this.actor = null; // Reset actor to force recreation with new identity
    };
    SessionClient.prototype.getActor = function (requireAuth) {
        if (requireAuth === void 0) { requireAuth = true; }
        return __awaiter(this, void 0, Promise, function () {
            var agent, actor, status, whoami, sessions, testError_1, error_2, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[SessionClient] Getting actor, requireAuth:', requireAuth);
                        if (requireAuth && !this.currentIdentity) {
                            console.warn('[SessionClient] Authentication required but no current identity');
                            throw new Error('User not authenticated');
                        }
                        // If we already have an actor and don't need to reinitialize, return it
                        if (this.actor && this.isInitialized) {
                            console.log('[SessionClient] Returning cached actor');
                            return [2 /*return*/, this.actor];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 13, , 14]);
                        console.log("[SessionClient] Creating new agent for " + (isLocal ? 'local' : 'production') + " environment");
                        agent = new agent_1.HttpAgent({
                            host: PRODUCTION_HOST,
                            identity: this.currentIdentity || undefined
                        });
                        console.log('[SessionClient] Running in production mode');
                        // Create a new actor with the correct type
                        console.log('[SessionClient] Creating actor with canister ID:', SESSIONS_CANISTER_ID);
                        actor = agent_1.Actor.createActor(sessions_idl_1.idlFactory, {
                            agent: agent,
                            canisterId: SESSIONS_CANISTER_ID
                        });
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 11, , 12]);
                        return [4 /*yield*/, agent.status()];
                    case 3:
                        status = _a.sent();
                        console.log('[SessionClient] Agent status:', status);
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 9, , 10]);
                        if (!(typeof actor.whoami === 'function')) return [3 /*break*/, 6];
                        return [4 /*yield*/, actor.whoami()];
                    case 5:
                        whoami = _a.sent();
                        console.log('[SessionClient] Actor test successful, principal:', whoami.toString());
                        return [3 /*break*/, 8];
                    case 6:
                        console.log('[SessionClient] whoami method not available, skipping test');
                        return [4 /*yield*/, actor.getAllSessions()["catch"](function () { return []; })];
                    case 7:
                        sessions = _a.sent();
                        console.log("[SessionClient] Successfully fetched " + sessions.length + " sessions");
                        _a.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        testError_1 = _a.sent();
                        console.warn('[SessionClient] Actor test warning:', testError_1);
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_2 = _a.sent();
                        console.error('[SessionClient] Error during actor initialization:', error_2);
                        return [3 /*break*/, 12];
                    case 12:
                        this.actor = actor;
                        this.isInitialized = true;
                        console.log('[SessionClient] Actor initialized successfully');
                        return [2 /*return*/, actor];
                    case 13:
                        error_3 = _a.sent();
                        console.error('Failed to create actor:', error_3);
                        this.actor = null;
                        this.isInitialized = false;
                        throw new Error("Failed to initialize actor: " + formatError(error_3));
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    SessionClient.prototype.createSession = function (input) {
        return __awaiter(this, void 0, Promise, function () {
            var error, actor, sessionInput, response, error, error_4, errorMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[SessionClient] Creating session with input:', input);
                        if (!this.currentIdentity) {
                            error = 'Must be authenticated to create a session';
                            console.error('[SessionClient]', error);
                            throw new Error(error);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        console.log('[SessionClient] Getting actor...');
                        return [4 /*yield*/, this.getActor(true)];
                    case 2:
                        actor = _a.sent();
                        console.log('[SessionClient] Actor obtained, calling createSession...');
                        sessionInput = {
                            title: String(input.title),
                            description: String(input.description),
                            sessionType: input.sessionType,
                            scheduledTime: BigInt(input.scheduledTime),
                            duration: BigInt(input.duration),
                            maxAttendees: BigInt(input.maxAttendees),
                            hostName: String(input.hostName),
                            hostAvatar: String(input.hostAvatar),
                            tags: input.tags.map(function (tag) { return String(tag); }),
                            isRecordingEnabled: Boolean(input.isRecordingEnabled || false),
                            jitsiConfig: []
                        };
                        console.log('[SessionClient] Calling createSession with:', sessionInput);
                        return [4 /*yield*/, actor.createSession(sessionInput)];
                    case 3:
                        response = _a.sent();
                        console.log('[SessionClient] Received response:', response);
                        if (!response) {
                            throw new Error('No response received from canister');
                        }
                        if ('err' in response) {
                            error = "Failed to create session: " + JSON.stringify(response.err);
                            console.error('[SessionClient]', error);
                            throw new Error(error);
                        }
                        if (!('ok' in response) || !response.ok) {
                            throw new Error('Invalid response format from canister');
                        }
                        console.log('[SessionClient] Session created successfully:', response.ok);
                        // Type assertion to ensure response.ok is ISession
                        return [2 /*return*/, this.normalizeSession(response.ok)];
                    case 4:
                        error_4 = _a.sent();
                        errorMsg = "Failed to create session: " + formatError(error_4);
                        console.error('[SessionClient]', errorMsg, error_4);
                        throw new Error(errorMsg);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SessionClient.prototype.toNumber = function (value, fieldName) {
        if (value === undefined || value === null) {
            throw new Error("Missing required field: " + fieldName);
        }
        if (typeof value === 'bigint') {
            return Number(value);
        }
        var num = Number(value);
        if (isNaN(num)) {
            throw new Error("Invalid number format for field " + fieldName + ": " + value);
        }
        return num;
    };
    SessionClient.prototype.toString = function (value, fieldName) {
        if (value === undefined || value === null) {
            throw new Error("Missing required field: " + fieldName);
        }
        return String(value);
    };
    SessionClient.prototype.normalizeSession = function (session) {
        var _this = this;
        var _a, _b;
        if (!session) {
            throw new Error('Cannot normalize undefined or null session');
        }
        try {
            console.log('[SessionClient] Normalizing session data:', session);
            // Normalize the session data with safe field access
            var normalized = {
                id: this.toString(session.id, 'id'),
                title: this.toString(session.title, 'title'),
                description: this.toString(session.description, 'description'),
                sessionType: this.normalizeSessionType(session.sessionType),
                scheduledTime: BigInt(((_a = session.scheduledTime) === null || _a === void 0 ? void 0 : _a.toString()) || '0'),
                duration: Number(session.duration || 0),
                maxAttendees: Number(session.maxAttendees || 0),
                host: session.host ? this.toString(session.host, 'host') : '',
                hostName: session.hostName ? this.toString(session.hostName, 'hostName') : '',
                hostAvatar: session.hostAvatar ? this.toString(session.hostAvatar, 'hostAvatar') : '',
                status: this.normalizeSessionStatus(session.status),
                attendees: Array.isArray(session.attendees)
                    ? session.attendees.map(function (a) { return a ? _this.toString(a, 'attendee') : ''; }).filter(Boolean)
                    : [],
                createdAt: BigInt(((_b = session.createdAt) === null || _b === void 0 ? void 0 : _b.toString()) || Date.now().toString() + '000000'),
                updatedAt: session.updatedAt ? BigInt(session.updatedAt.toString()) : BigInt(Date.now() * 1000000),
                recordingUrl: session.recordingUrl ? this.toString(session.recordingUrl, 'recordingUrl') : null,
                meetingUrl: session.meetingUrl ? this.toString(session.meetingUrl, 'meetingUrl') : null,
                tags: Array.isArray(session.tags)
                    ? session.tags.map(function (t) { return t ? _this.toString(t, 'tag') : ''; }).filter(Boolean)
                    : [],
                isRecordingEnabled: Boolean(session.isRecordingEnabled),
                jitsiConfig: session.jitsiConfig || []
            };
            // Add optional price field if it exists
            if ('price' in session && session.price !== undefined) {
                normalized.price = Number(session.price);
            }
            // Add recordSession with a default value
            normalized.recordSession = Boolean(session.isRecordingEnabled);
            // Assert the type to Session since we've ensured all required fields are present
            return normalized;
        }
        catch (error) {
            console.error('[SessionClient] Error normalizing session:', error, session);
            throw new Error("Failed to normalize session: " + (error instanceof Error ? error.message : String(error)));
        }
    };
    SessionClient.prototype.normalizeSessionStatus = function (status) {
        if (typeof status === 'object' && status !== null) {
            if ('scheduled' in status)
                return { scheduled: null };
            if ('live' in status)
                return { live: null };
            if ('completed' in status)
                return { completed: null };
            if ('cancelled' in status)
                return { cancelled: null };
        }
        return { scheduled: null };
    };
    SessionClient.prototype.normalizeSessionType = function (type) {
        if (typeof type === 'object' && type !== null) {
            if ('video' in type)
                return { video: null };
            if ('voice' in type)
                return { voice: null };
        }
        return { video: null };
    };
    SessionClient.prototype.getSession = function (sessionId) {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getActor(false)];
                    case 1:
                        actor = _a.sent();
                        return [4 /*yield*/, actor.getSession(sessionId)];
                    case 2:
                        result = _a.sent();
                        if (!result) {
                            console.warn("[SessionClient] No result received for session " + sessionId);
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, this.normalizeSession(result)];
                    case 3:
                        error_5 = _a.sent();
                        console.error("[SessionClient] Error getting session " + sessionId + ":", error_5);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SessionClient.prototype.getAllSessions = function (maxRetries, retryDelay) {
        if (maxRetries === void 0) { maxRetries = 3; }
        if (retryDelay === void 0) { retryDelay = 1000; }
        return __awaiter(this, void 0, Promise, function () {
            var lastError, _loop_1, this_1, attempt, state_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_1 = function (attempt) {
                            var actor, sessions, error_6;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 6]);
                                        console.log("[SessionClient] Fetching sessions (attempt " + attempt + "/" + maxRetries + ")");
                                        return [4 /*yield*/, this_1.getActor(false)];
                                    case 1:
                                        actor = _a.sent();
                                        return [4 /*yield*/, actor.getAllSessions()];
                                    case 2:
                                        sessions = _a.sent();
                                        if (!sessions || !Array.isArray(sessions)) {
                                            console.warn('[SessionClient] No sessions array received from canister');
                                            return [2 /*return*/, { value: [] }];
                                        }
                                        return [2 /*return*/, { value: sessions.map(function (session) { return _this.normalizeSession(session); }) }];
                                    case 3:
                                        error_6 = _a.sent();
                                        lastError = error_6;
                                        console.warn("[SessionClient] Attempt " + attempt + " failed:", error_6);
                                        if (!(attempt < maxRetries)) return [3 /*break*/, 5];
                                        // Wait before retrying
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, retryDelay * attempt); })];
                                    case 4:
                                        // Wait before retrying
                                        _a.sent();
                                        _a.label = 5;
                                    case 5: return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 1;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= maxRetries)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.error('[SessionClient] All attempts to fetch sessions failed');
                        throw new Error("Failed to get sessions after " + maxRetries + " attempts: " + formatError(lastError));
                }
            });
        });
    };
    SessionClient.prototype.updateSession = function (sessionId, updates) {
        return __awaiter(this, void 0, Promise, function () {
            var updateData, actor, result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentIdentity) {
                            throw new Error('Must be authenticated to update a session');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        updateData = {};
                        // Only include defined values in the update
                        if (updates.title !== undefined)
                            updateData.title = updates.title;
                        if (updates.description !== undefined)
                            updateData.description = updates.description;
                        if (updates.sessionType !== undefined)
                            updateData.sessionType = updates.sessionType;
                        if (updates.scheduledTime !== undefined) {
                            updateData.scheduledTime = BigInt(updates.scheduledTime.toString());
                        }
                        if (updates.duration !== undefined)
                            updateData.duration = BigInt(updates.duration);
                        if (updates.maxAttendees !== undefined)
                            updateData.maxAttendees = BigInt(updates.maxAttendees);
                        if (updates.recordingUrl !== undefined) {
                            updateData.recordingUrl = updates.recordingUrl;
                        }
                        if (updates.tags !== undefined)
                            updateData.tags = updates.tags;
                        return [4 /*yield*/, this.getActor(true)];
                    case 2:
                        actor = _a.sent();
                        return [4 /*yield*/, actor.updateSession(sessionId, updateData)];
                    case 3:
                        result = _a.sent();
                        if (!result) {
                            throw new Error('No response received from canister');
                        }
                        if ('err' in result) {
                            throw new Error("Failed to update session: " + JSON.stringify(result.err));
                        }
                        if (!('ok' in result)) {
                            throw new Error('Invalid response format from canister');
                        }
                        return [2 /*return*/, this.normalizeSession(result.ok)];
                    case 4:
                        error_7 = _a.sent();
                        console.error("[SessionClient] Error updating session " + sessionId + ":", error_7);
                        throw new Error("Failed to update session: " + formatError(error_7));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SessionClient.prototype.deleteSession = function (sessionId) {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentIdentity) {
                            throw new Error('Must be authenticated to delete a session');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getActor(true)];
                    case 2:
                        actor = _a.sent();
                        return [4 /*yield*/, actor.deleteSession(sessionId)];
                    case 3:
                        result = _a.sent();
                        if (!result) {
                            throw new Error('No response received from canister');
                        }
                        if ('err' in result) {
                            throw new Error("Failed to delete session: " + JSON.stringify(result.err));
                        }
                        return [2 /*return*/, result.ok === true];
                    case 4:
                        error_8 = _a.sent();
                        console.error("[SessionClient] Error deleting session " + sessionId + ":", error_8);
                        throw new Error("Failed to delete session: " + formatError(error_8));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SessionClient.prototype.joinSession = function (sessionId) {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentIdentity) {
                            throw new Error('Must be authenticated to join a session');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getActor(true)];
                    case 2:
                        actor = _a.sent();
                        return [4 /*yield*/, actor.joinSession(sessionId)];
                    case 3:
                        result = _a.sent();
                        if (!result || !('ok' in result) || !result.ok) {
                            throw new Error('Failed to join session');
                        }
                        return [2 /*return*/, this.normalizeSession(result.ok)];
                    case 4:
                        error_9 = _a.sent();
                        console.error("[SessionClient] Error joining session " + sessionId + ":", error_9);
                        throw new Error("Failed to join session: " + formatError(error_9));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SessionClient.prototype.leaveSession = function (sessionId) {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentIdentity) {
                            throw new Error('Must be authenticated to leave a session');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getActor(true)];
                    case 2:
                        actor = _a.sent();
                        return [4 /*yield*/, actor.leaveSession(sessionId)];
                    case 3:
                        result = _a.sent();
                        if (!result || !('ok' in result) || !result.ok) {
                            throw new Error('Failed to leave session');
                        }
                        return [2 /*return*/, this.normalizeSession(result.ok)];
                    case 4:
                        error_10 = _a.sent();
                        console.error("[SessionClient] Error leaving session " + sessionId + ":", error_10);
                        throw new Error("Failed to leave session: " + formatError(error_10));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SessionClient.prototype.updateSessionStatus = function (sessionId, status) {
        return __awaiter(this, void 0, Promise, function () {
            var statusUpdate, actor, result, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentIdentity) {
                            throw new Error('Must be authenticated to update session status');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        statusUpdate = void 0;
                        if ('scheduled' in status)
                            statusUpdate = { scheduled: null };
                        else if ('live' in status)
                            statusUpdate = { live: null };
                        else if ('completed' in status)
                            statusUpdate = { completed: null };
                        else if ('cancelled' in status)
                            statusUpdate = { cancelled: null };
                        else
                            throw new Error('Invalid session status');
                        return [4 /*yield*/, this.getActor(true)];
                    case 2:
                        actor = _a.sent();
                        return [4 /*yield*/, actor.updateSessionStatus(sessionId, statusUpdate)];
                    case 3:
                        result = _a.sent();
                        if (!result) {
                            throw new Error('No response received from canister');
                        }
                        if ('err' in result) {
                            throw new Error("Failed to update session status: " + JSON.stringify(result.err));
                        }
                        if (!('ok' in result) || !result.ok) {
                            throw new Error('Invalid response format from canister');
                        }
                        return [2 /*return*/, this.normalizeSession(result.ok)];
                    case 4:
                        error_11 = _a.sent();
                        console.error("[SessionClient] Error updating status for session " + sessionId + ":", error_11);
                        throw new Error("Failed to update session status: " + formatError(error_11));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SessionClient.prototype.getMySessions = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getAllSessions()];
            });
        });
    };
    SessionClient.prototype.startRecording = function (sessionId) {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentIdentity) {
                            throw new Error('Must be authenticated to start recording');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getActor(true)];
                    case 2:
                        actor = _a.sent();
                        return [4 /*yield*/, actor.startRecording(sessionId)];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 4:
                        error_12 = _a.sent();
                        console.error("[SessionClient] Error starting recording for session " + sessionId + ":", error_12);
                        return [2 /*return*/, { err: "Failed to start recording: " + formatError(error_12) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SessionClient.prototype.stopRecording = function (sessionId) {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentIdentity) {
                            throw new Error('Must be authenticated to stop recording');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getActor(true)];
                    case 2:
                        actor = _a.sent();
                        return [4 /*yield*/, actor.stopRecording(sessionId)];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 4:
                        error_13 = _a.sent();
                        console.error("[SessionClient] Error stopping recording for session " + sessionId + ":", error_13);
                        return [2 /*return*/, { err: "Failed to stop recording: " + formatError(error_13) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SessionClient.prototype.getSessionStatusLabel = function (status) {
        if ('scheduled' in status)
            return 'Scheduled';
        if ('live' in status)
            return 'Live';
        if ('completed' in status)
            return 'Completed';
        if ('cancelled' in status)
            return 'Cancelled';
        return 'Unknown';
    };
    SessionClient.prototype.getSessionTypeLabel = function (type) {
        if ('video' in type)
            return 'Video';
        if ('voice' in type)
            return 'Voice';
        if ('screen_share' in type)
            return 'Screen Share';
        if ('webinar' in type)
            return 'Webinar';
        return 'Unknown';
    };
    return SessionClient;
}());
exports.SessionClient = SessionClient;
// Create and export a singleton instance
exports.sessionClient = SessionClient.getInstance();
// Expose on window for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.sessionClient = exports.sessionClient;
}
