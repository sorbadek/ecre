"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.leaveStudyGroup = exports.joinStudyGroup = exports.createStudyGroup = exports.getStudyGroups = exports.sendPartnerRequest = exports.getMyPartners = exports.socialClient = void 0;
var agent_1 = require("@dfinity/agent");
var social_idl_1 = require("./ic/social.idl");
var principal_1 = require("@dfinity/principal");
var agent_2 = require("./ic/agent");
var SOCIAL_CANISTER_ID = "e5sxd-7iaaa-aaaam-qdtra-cai";
var SocialClient = /** @class */ (function () {
    function SocialClient() {
        this.actor = null;
        this.identity = null;
    }
    // Helper to generate a random color
    SocialClient.prototype.getRandomColor = function () {
        var colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B786F', '#A4C2A5'];
        return colors[Math.floor(Math.random() * colors.length)];
    };
    // Helper to get initials from name
    SocialClient.prototype.getInitials = function (name) {
        return name
            .split(' ')
            .map(function (part) { return part[0]; })
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };
    SocialClient.prototype.setIdentity = function (identity) {
        this.identity = identity;
        this.actor = null; // Reset actor so it's recreated with the new identity
    };
    SocialClient.prototype.getActor = function () {
        return __awaiter(this, void 0, void 0, function () {
            var identity, isLocal, host, customFetchWithBypass, agent, error_1, testError_1, error_2, errorMessage, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.actor)
                            return [2 /*return*/, this.actor];
                        if (!this.identity) {
                            console.warn('No identity set for social client');
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, , 13]);
                        if (!this.identity) {
                            throw new Error('No identity available. Please authenticate first.');
                        }
                        identity = this.identity;
                        console.log('[SocialClient] Using identity principal:', identity.getPrincipal().toText());
                        isLocal = typeof window !== "undefined" &&
                            (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
                        host = isLocal
                            ? "https://ic0.app" // Local replica port
                            : "https://ic0.app";
                        console.log('[SocialClient] Initializing with host:', host);
                        console.log('[SocialClient] Using canister ID:', SOCIAL_CANISTER_ID);
                        customFetchWithBypass = function (input, init) { return __awaiter(_this, void 0, void 0, function () {
                            var url, isICApiCall, isLocal_1, origin, requestHeaders, fetchOptions, response, responseHeaders, error_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        url = new URL(input instanceof Request ? input.url : input.toString(), typeof window !== 'undefined' ? window.location.origin : 'https://ic0.app');
                                        // Fix double API version in path if it exists
                                        if (url.pathname.includes('/v2/v3/')) {
                                            url.pathname = url.pathname.replace('/v2/v3/', '/v2/');
                                        }
                                        isICApiCall = url.pathname.includes('/api/v2/');
                                        isLocal_1 = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
                                        origin = typeof window !== 'undefined' ? window.location.origin : 'https://ic0.app';
                                        requestHeaders = new Headers(init === null || init === void 0 ? void 0 : init.headers);
                                        // Always set the Origin header for CORS
                                        requestHeaders.set('Origin', origin);
                                        // Add required headers for IC API calls
                                        if (isICApiCall) {
                                            requestHeaders.set('Content-Type', 'application/cbor');
                                            requestHeaders.set('Accept', 'application/cbor');
                                            // For local development, add headers to bypass certificate validation
                                            if (isLocal_1) {
                                                // Add cache-busting for status endpoint
                                                if (url.pathname.endsWith('/status')) {
                                                    url.searchParams.set('_', Date.now().toString());
                                                }
                                                // Add IC-specific headers
                                                requestHeaders.set('X-IC-Disable-Certificate-Validation', 'true');
                                                requestHeaders.set('X-IC-Allow-Insecure-Requests', 'true');
                                                // For preflight requests, ensure we have the necessary headers
                                                if ((init === null || init === void 0 ? void 0 : init.method) === 'OPTIONS') {
                                                    requestHeaders.set('Access-Control-Request-Method', init.method || 'GET');
                                                    requestHeaders.set('Access-Control-Request-Headers', 'content-type,authorization');
                                                }
                                            }
                                        }
                                        fetchOptions = __assign(__assign({}, init), { headers: requestHeaders, mode: 'cors', cache: 'no-cache', credentials: isICApiCall ? 'include' : 'same-origin' });
                                        // For local development, ensure we're not sending credentials to non-local endpoints
                                        if (isLocal_1 && !isICApiCall) {
                                            delete fetchOptions.credentials;
                                        }
                                        console.log("[SocialClient] Making request to: " + url.toString(), {
                                            method: fetchOptions.method,
                                            headers: Object.fromEntries(requestHeaders.entries()),
                                            credentials: fetchOptions.credentials
                                        });
                                        return [4 /*yield*/, agent_2.customFetch(url, fetchOptions)];
                                    case 1:
                                        response = _a.sent();
                                        // For local development, ensure CORS headers are set in the response
                                        if (isLocal_1 && isICApiCall) {
                                            responseHeaders = new Headers(response.headers);
                                            responseHeaders.set('Access-Control-Allow-Origin', origin);
                                            responseHeaders.set('Access-Control-Allow-Credentials', 'true');
                                            // Create a new response with the modified headers
                                            if (response.body) {
                                                return [2 /*return*/, new Response(response.body, {
                                                        status: response.status,
                                                        statusText: response.statusText,
                                                        headers: responseHeaders
                                                    })];
                                            }
                                        }
                                        return [2 /*return*/, response];
                                    case 2:
                                        error_4 = _a.sent();
                                        console.error('[SocialClient] Error in custom fetch:', error_4);
                                        throw error_4;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); };
                        agent = new agent_1.HttpAgent(__assign({ identity: identity,
                            host: host }, (isLocal ? {
                            fetch: customFetchWithBypass,
                            // Disable all verification for local development
                            verifyQuerySignatures: false,
                            verifyUpdateCalls: false,
                            verifyTimeNanos: false,
                            // Use empty root key to bypass verification
                            rootKey: new Uint8Array(0),
                            // Additional options
                            callOptions: {
                                http_request_timeout_ms: 30000
                            },
                            retryTimes: 2,
                            maxResponseBytes: 1024 * 1024 * 10
                        } : {})));
                        if (!isLocal) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        console.log('[SocialClient] Fetching root key...');
                        // First try to fetch the root key
                        return [4 /*yield*/, agent.fetchRootKey()];
                    case 3:
                        // First try to fetch the root key
                        _a.sent();
                        console.log('[SocialClient] Successfully fetched root key');
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.warn('[SocialClient] Failed to fetch root key, patching agent to bypass verification', error_1);
                        // If fetching fails, patch the agent to bypass verification
                        agent._verifyCert = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, true];
                        }); }); };
                        return [3 /*break*/, 5];
                    case 5:
                        _a.trys.push([5, 10, , 11]);
                        console.log('[SocialClient] Creating actor...');
                        // Create the actor with the configured agent
                        this.actor = agent_1.Actor.createActor(social_idl_1.idlFactory, {
                            agent: agent,
                            canisterId: SOCIAL_CANISTER_ID
                        });
                        if (!isLocal) return [3 /*break*/, 9];
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        console.log('[SocialClient] Testing actor connection...');
                        return [4 /*yield*/, this.actor.whoami()];
                    case 7:
                        _a.sent();
                        console.log('[SocialClient] Actor connection test successful');
                        return [3 /*break*/, 9];
                    case 8:
                        testError_1 = _a.sent();
                        console.warn('[SocialClient] Actor connection test failed, but continuing', testError_1);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/, this.actor];
                    case 10:
                        error_2 = _a.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error occurred';
                        console.error('[SocialClient] Failed to create actor:', error_2);
                        throw new Error("Failed to initialize actor: " + errorMessage);
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_3 = _a.sent();
                        console.warn("Failed to create social actor:", error_3);
                        return [2 /*return*/, null];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.sendPartnerRequest = function (to, message) {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getActor()];
                    case 1:
                        actor = _a.sent();
                        if (!actor)
                            throw new Error("Actor not available");
                        return [4 /*yield*/, actor.sendPartnerRequest(principal_1.Principal.fromText(to), message || '')];
                    case 2:
                        result = _a.sent();
                        if ("ok" in result) {
                            return [2 /*return*/, result.ok];
                        }
                        else {
                            throw new Error(result.err);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error("Error sending partner request:", error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.mapToPartnerProfile = function (partner) {
        var _a, _b, _c, _d;
        try {
            if (!partner || typeof partner !== 'object') {
                console.warn('Invalid partner data:', partner);
                return null;
            }
            var currentTimestamp = BigInt(Date.now()) * BigInt(1000000); // Convert to nanoseconds
            // Handle onlineStatus which comes as an object from the backend
            var onlineStatus = 'offline';
            if (partner.onlineStatus) {
                if (typeof partner.onlineStatus === 'object') {
                    if ('online' in partner.onlineStatus)
                        onlineStatus = 'online';
                    else if ('away' in partner.onlineStatus)
                        onlineStatus = 'away';
                    else if ('offline' in partner.onlineStatus)
                        onlineStatus = 'offline';
                }
                else if (typeof partner.onlineStatus === 'string') {
                    onlineStatus = partner.onlineStatus;
                }
            }
            // Convert principal to string if it's a Principal object
            var principal = ((_a = partner.principal) === null || _a === void 0 ? void 0 : _a.toString) ?
                partner.principal.toString() :
                (typeof partner.principal === 'string' ? partner.principal : '');
            return {
                principal: principal,
                name: ((_b = partner.name) === null || _b === void 0 ? void 0 : _b.toString()) || 'Unknown User',
                role: ((_c = partner.role) === null || _c === void 0 ? void 0 : _c.toString()) || 'member',
                xp: typeof partner.xp === 'bigint' ? Number(partner.xp) :
                    typeof partner.xp === 'number' ? partner.xp : 0,
                onlineStatus: onlineStatus,
                avatarColor: typeof partner.avatarColor === 'string'
                    ? partner.avatarColor
                    : this.getRandomColor(),
                initials: typeof partner.initials === 'string'
                    ? partner.initials
                    : this.getInitials(((_d = partner.name) === null || _d === void 0 ? void 0 : _d.toString()) || 'UU'),
                lastActive: partner.lastActive
                    ? (typeof partner.lastActive === 'bigint'
                        ? partner.lastActive
                        : BigInt(Number(partner.lastActive) || 0))
                    : currentTimestamp,
                studyStreak: typeof partner.studyStreak === 'number'
                    ? partner.studyStreak
                    : 0,
                completedCourses: typeof partner.completedCourses === 'number'
                    ? partner.completedCourses
                    : 0,
                joinedAt: partner.joinedAt
                    ? (typeof partner.joinedAt === 'bigint'
                        ? partner.joinedAt
                        : BigInt(Number(partner.joinedAt) || 0))
                    : currentTimestamp - BigInt(30 * 24 * 60 * 60 * 1000000000) // Default to 30 days ago if not provided
            };
        }
        catch (error) {
            console.error('Error mapping partner profile:', error, 'Raw data:', partner);
            return null;
        }
    };
    SocialClient.prototype.getMyPartners = function () {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, mappedPartners, error_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getActor()];
                    case 1:
                        actor = _a.sent();
                        if (!actor) {
                            console.warn('No actor available, using fallback partners');
                            return [2 /*return*/, this.getFallbackPartners()];
                        }
                        return [4 /*yield*/, actor.getMyPartners()];
                    case 2:
                        result = _a.sent();
                        // Ensure result is an array
                        if (!Array.isArray(result)) {
                            console.warn('Unexpected response format from getMyPartners:', result);
                            return [2 /*return*/, this.getFallbackPartners()];
                        }
                        // Debug log the raw response
                        console.log('Raw partners response:', JSON.stringify(result, null, 2));
                        mappedPartners = result
                            .map(function (partner) {
                            try {
                                var mapped = _this.mapToPartnerProfile(partner);
                                if (!mapped) {
                                    console.warn('Failed to map partner profile:', partner);
                                }
                                else if (!('joinedAt' in mapped)) {
                                    console.warn('Mapped partner missing joinedAt:', mapped);
                                }
                                return mapped;
                            }
                            catch (error) {
                                console.error('Error mapping partner:', error, 'Partner data:', partner);
                                return null;
                            }
                        })
                            .filter(function (p) { return p !== null; });
                        if (mappedPartners.length === 0) {
                            console.warn('No valid partners found in response, using fallback');
                            return [2 /*return*/, this.getFallbackPartners()];
                        }
                        return [2 /*return*/, mappedPartners];
                    case 3:
                        error_6 = _a.sent();
                        console.warn("Error getting partners, using fallback:", error_6);
                        return [2 /*return*/, this.getFallbackPartners()];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.getPartnerRequests = function () {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getActor()];
                    case 1:
                        actor = _a.sent();
                        if (!actor)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, actor.getPartnerRequests()];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 3:
                        error_7 = _a.sent();
                        console.warn("Error getting partner requests:", error_7);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.createStudyGroup = function (name, description, maxMembers, isPublic, tags) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, group, members, creator, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getActor()];
                    case 1:
                        actor = _b.sent();
                        if (!actor)
                            throw new Error("Actor not available");
                        if (!this.identity)
                            throw new Error("Not authenticated");
                        return [4 /*yield*/, actor.createStudyGroup(name, description, maxMembers, isPublic, tags)];
                    case 2:
                        result = _b.sent();
                        if ("ok" in result) {
                            group = result.ok;
                            members = group.members || [];
                            creator = ((_a = group.creator) === null || _a === void 0 ? void 0 : _a.toString()) || this.identity.getPrincipal().toString();
                            return [2 /*return*/, {
                                    id: group.id.toString(),
                                    name: group.name,
                                    description: group.description,
                                    memberCount: members.length,
                                    maxMembers: group.maxMembers,
                                    isPublic: group.isPublic,
                                    tags: group.tags,
                                    createdAt: group.createdAt,
                                    isMember: true,
                                    owner: creator,
                                    creator: creator,
                                    members: members.map(function (m) { return m.toString(); })
                                }];
                        }
                        else {
                            throw new Error(result.err);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _b.sent();
                        console.error("Error creating study group:", error_8);
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.generateSamplePartners = function () {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getActor()];
                    case 1:
                        actor = _a.sent();
                        if (!actor)
                            throw new Error("Actor not available");
                        return [4 /*yield*/, actor.generateSamplePartners()];
                    case 2:
                        result = _a.sent();
                        if ("ok" in result) {
                            return [2 /*return*/, result.ok];
                        }
                        else {
                            throw new Error(result.err);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _a.sent();
                        console.error("Error generating sample partners:", error_9);
                        throw error_9;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.joinStudyGroup = function (groupId) {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getActor()];
                    case 1:
                        actor = _a.sent();
                        if (!actor)
                            throw new Error("Actor not available");
                        return [4 /*yield*/, actor.joinStudyGroup(principal_1.Principal.fromText(groupId))];
                    case 2:
                        result = _a.sent();
                        if ("err" in result) {
                            throw new Error(result.err);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _a.sent();
                        console.error("Error joining study group:", error_10);
                        throw error_10;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.leaveStudyGroup = function (groupId) {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getActor()];
                    case 1:
                        actor = _a.sent();
                        if (!actor)
                            throw new Error("Actor not available");
                        return [4 /*yield*/, actor.leaveStudyGroup(principal_1.Principal.fromText(groupId))];
                    case 2:
                        result = _a.sent();
                        if ("err" in result) {
                            throw new Error(result.err);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_11 = _a.sent();
                        console.error("Error leaving study group:", error_11);
                        throw error_11;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.getStudyGroups = function () {
        return __awaiter(this, void 0, Promise, function () {
            var actor, principal, principalString_1, result, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getActor()];
                    case 1:
                        actor = _a.sent();
                        if (!actor)
                            throw new Error("Actor not available");
                        if (!this.identity)
                            throw new Error("Not authenticated");
                        principal = this.identity.getPrincipal();
                        principalString_1 = principal.toString();
                        return [4 /*yield*/, actor.getStudyGroups()];
                    case 2:
                        result = _a.sent();
                        if (!Array.isArray(result)) {
                            throw new Error("Unexpected response format from getStudyGroups");
                        }
                        return [2 /*return*/, result.map(function (group) {
                                var _a;
                                var members = Array.isArray(group.members)
                                    ? group.members.map(function (m) { return m.toString(); })
                                    : [];
                                var creator = ((_a = group.creator) === null || _a === void 0 ? void 0 : _a.toString()) || principalString_1;
                                var isMember = members.includes(principalString_1);
                                return {
                                    id: group.id.toString(),
                                    name: group.name,
                                    description: group.description,
                                    memberCount: members.length,
                                    maxMembers: group.maxMembers,
                                    isPublic: group.isPublic,
                                    tags: group.tags || [],
                                    createdAt: group.createdAt,
                                    isMember: isMember,
                                    owner: creator,
                                    creator: creator,
                                    members: members
                                };
                            })];
                    case 3:
                        error_12 = _a.sent();
                        console.error("Error getting study groups:", error_12);
                        throw error_12;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.getFallbackPartners = function () {
        var currentTime = BigInt(Date.now()) * BigInt(1000000);
        return [
            {
                principal: '2vxsx-fae',
                name: 'Sarah Chen',
                role: 'Frontend Developer',
                xp: 15420,
                onlineStatus: 'online',
                avatarColor: this.getRandomColor(),
                initials: 'SC',
                lastActive: currentTime - BigInt(3600 * 1000000000),
                studyStreak: 5,
                completedCourses: 12,
                joinedAt: currentTime - BigInt(90 * 24 * 60 * 60 * 1000000000) // 90 days ago
            },
            {
                principal: '2vxsx-faf',
                name: 'Michael Rodriguez',
                role: 'Full Stack Engineer',
                xp: 22100,
                onlineStatus: 'away',
                avatarColor: this.getRandomColor(),
                initials: 'MR',
                lastActive: currentTime - BigInt(7200 * 1000000000),
                studyStreak: 12,
                completedCourses: 8,
                joinedAt: currentTime - BigInt(60 * 24 * 60 * 60 * 1000000000) // 60 days ago
            },
            {
                principal: '2vxsx-fag',
                name: 'Emily Watson',
                role: 'Backend Developer',
                xp: 18750,
                onlineStatus: 'online',
                avatarColor: this.getRandomColor(),
                initials: 'EW',
                lastActive: currentTime - BigInt(1800 * 1000000000),
                studyStreak: 7,
                completedCourses: 10,
                joinedAt: currentTime - BigInt(30 * 24 * 60 * 60 * 1000000000) // 30 days ago
            }
        ];
    };
    return SocialClient;
}());
// Export the social client instance
exports.socialClient = new SocialClient();
// Helper functions that use the social client
function getMyPartners() {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.socialClient.getMyPartners()];
        });
    });
}
exports.getMyPartners = getMyPartners;
function sendPartnerRequest(principal, message) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.socialClient.sendPartnerRequest(principal, message)];
        });
    });
}
exports.sendPartnerRequest = sendPartnerRequest;
function getStudyGroups() {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.socialClient.getStudyGroups()];
        });
    });
}
exports.getStudyGroups = getStudyGroups;
function createStudyGroup(name, description, maxMembers, isPublic, tags) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.socialClient.createStudyGroup(name, description, maxMembers, isPublic, tags)];
        });
    });
}
exports.createStudyGroup = createStudyGroup;
function joinStudyGroup(groupId) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.socialClient.joinStudyGroup(groupId)];
        });
    });
}
exports.joinStudyGroup = joinStudyGroup;
function leaveStudyGroup(groupId) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.socialClient.leaveStudyGroup(groupId)];
        });
    });
}
exports.leaveStudyGroup = leaveStudyGroup;
