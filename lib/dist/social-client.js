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
var SOCIAL_CANISTER_ID = "ekhd5-baaaa-aaaac-qaitq-cai";
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
    SocialClient.prototype._verifyCert = function () {
        // No-op in production
    };
    SocialClient.prototype.customFetchWithBypass = function (input, init) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        url = new URL(input instanceof Request ? input.url : input.toString(), 'https://ic0.app');
                        console.log("[SocialClient] Making request to: " + url.toString(), {
                            method: init === null || init === void 0 ? void 0 : init.method,
                            headers: (init === null || init === void 0 ? void 0 : init.headers) ? Object.fromEntries(new Headers(init.headers).entries()) : {}
                        });
                        return [4 /*yield*/, agent_2.customFetch(url, __assign(__assign({}, init), { headers: __assign(__assign({}, init === null || init === void 0 ? void 0 : init.headers), { 'Content-Type': 'application/cbor', 'Accept': 'application/cbor' }) }))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 2:
                        error_1 = _a.sent();
                        console.error('[SocialClient] Error in custom fetch:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.getActor = function () {
        return __awaiter(this, void 0, void 0, function () {
            var identity, host, agent, errorMessage;
            return __generator(this, function (_a) {
                if (this.actor)
                    return [2 /*return*/, this.actor];
                if (!this.identity) {
                    console.warn('No identity set for social client');
                    return [2 /*return*/, null];
                }
                try {
                    identity = this.identity;
                    console.log('[SocialClient] Using identity principal:', identity.getPrincipal().toText());
                    host = 'https://ic0.app';
                    console.log('[SocialClient] Initializing with host:', host);
                    console.log('[SocialClient] Using canister ID:', SOCIAL_CANISTER_ID);
                    agent = new agent_1.HttpAgent({
                        identity: identity,
                        host: host,
                        fetch: this.customFetchWithBypass.bind(this)
                    });
                    console.log('[SocialClient] Creating actor...');
                    this.actor = agent_1.Actor.createActor(social_idl_1.idlFactory, {
                        agent: agent,
                        canisterId: SOCIAL_CANISTER_ID
                    });
                    return [2 /*return*/, this.actor];
                }
                catch (error) {
                    errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    console.error('[SocialClient] Failed to create actor:', error);
                    throw new Error("Failed to initialize actor: " + errorMessage);
                }
                return [2 /*return*/];
            });
        });
    };
    SocialClient.prototype.sendPartnerRequest = function (to, message) {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_2;
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
                        error_2 = _a.sent();
                        console.error("Error sending partner request:", error_2);
                        throw error_2;
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
            var actor, result, mappedPartners, error_3;
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
                        error_3 = _a.sent();
                        console.warn("Error getting partners, using fallback:", error_3);
                        return [2 /*return*/, this.getFallbackPartners()];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.getPartnerRequests = function () {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_4;
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
                        error_4 = _a.sent();
                        console.warn("Error getting partner requests:", error_4);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.createStudyGroup = function (name, description, isPublic, tags, maxMembers) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, Promise, function () {
            var actor, nameStr, descriptionStr, isPublicNat, tagsArray, maxMembersNat, result, error_5;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getActor()];
                    case 1:
                        actor = _g.sent();
                        if (!actor)
                            throw new Error("Actor not available");
                        nameStr = String(name);
                        descriptionStr = String(description);
                        isPublicNat = isPublic ? 1n : 0n;
                        tagsArray = Array.isArray(tags) ? tags.map(String) : [];
                        maxMembersNat = BigInt(Math.max(1, Number(maxMembers) || 10));
                        return [4 /*yield*/, actor.createStudyGroup(nameStr, descriptionStr, isPublicNat, // Pass as BigInt (1n or 0n)
                            tagsArray, maxMembersNat)];
                    case 2:
                        result = _g.sent();
                        // Convert the result to a StudyGroup object
                        return [2 /*return*/, {
                                id: ((_a = result.id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                                name: ((_b = result.name) === null || _b === void 0 ? void 0 : _b.toString()) || '',
                                description: ((_c = result.description) === null || _c === void 0 ? void 0 : _c.toString()) || '',
                                createdBy: ((_d = result.createdBy) === null || _d === void 0 ? void 0 : _d.toString()) || '',
                                members: Array.isArray(result.members) ? result.members.map(function (m) { return m.toString(); }) : [],
                                maxMembers: result.maxMembers ? Number(result.maxMembers) : 10,
                                isPublic: result.isPublic === true || result.isPublic === 1 || result.isPublic === 1n,
                                tags: Array.isArray(result.tags) ? result.tags.map(String) : [],
                                createdAt: BigInt(result.createdAt || 0),
                                lastActivity: BigInt(result.lastActivity || 0),
                                memberCount: Array.isArray(result.members) ? result.members.length : 0,
                                isMember: false,
                                owner: ((_e = result.owner) === null || _e === void 0 ? void 0 : _e.toString()) || ((_f = result.createdBy) === null || _f === void 0 ? void 0 : _f.toString()) || ''
                            }];
                    case 3:
                        error_5 = _g.sent();
                        console.error("Error creating study group:", error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.generateSamplePartners = function () {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_6;
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
                        error_6 = _a.sent();
                        console.error("Error generating sample partners:", error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.joinStudyGroup = function (groupId) {
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
                            throw new Error("Actor not available");
                        return [4 /*yield*/, actor.joinStudyGroup(principal_1.Principal.fromText(groupId))];
                    case 2:
                        result = _a.sent();
                        if ("err" in result) {
                            throw new Error(result.err);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        console.error("Error joining study group:", error_7);
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.leaveStudyGroup = function (groupId) {
        return __awaiter(this, void 0, Promise, function () {
            var actor, result, error_8;
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
                        error_8 = _a.sent();
                        console.error("Error leaving study group:", error_8);
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.getStudyGroups = function () {
        return __awaiter(this, void 0, Promise, function () {
            var actor, groups, result, error_9, error_10;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getActor()];
                    case 1:
                        actor = _a.sent();
                        if (!actor) {
                            console.warn("Actor not available, cannot fetch study groups");
                            return [2 /*return*/, []];
                        }
                        groups = [];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, actor.getMyStudyGroups()];
                    case 3:
                        result = _a.sent();
                        if (Array.isArray(result)) {
                            groups = result;
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _a.sent();
                        console.warn("getMyStudyGroups not implemented, trying fallback");
                        // Fallback to empty array if not implemented
                        return [2 /*return*/, []];
                    case 5: 
                    // Convert the groups to the expected format
                    return [2 /*return*/, groups.map(function (group) {
                            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                            return ({
                                id: ((_a = group.id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                                name: ((_b = group.name) === null || _b === void 0 ? void 0 : _b.toString()) || 'Unnamed Group',
                                description: ((_c = group.description) === null || _c === void 0 ? void 0 : _c.toString()) || '',
                                createdBy: ((_d = group.createdBy) === null || _d === void 0 ? void 0 : _d.toString()) || '',
                                members: ((_e = group.members) === null || _e === void 0 ? void 0 : _e.map(function (m) { return m.toString(); })) || [],
                                maxMembers: Number(group.maxMembers || 10),
                                isPublic: group.isPublic === true || group.isPublic === 1 || group.isPublic === 'true',
                                tags: Array.isArray(group.tags) ? group.tags.map(String) : [],
                                createdAt: group.createdAt ? Number(group.createdAt / 1000000n) : Date.now(),
                                lastActivity: group.lastActivity ? Number(group.lastActivity / 1000000n) : Date.now(),
                                memberCount: ((_f = group.members) === null || _f === void 0 ? void 0 : _f.length) || 0,
                                isMember: ((_g = group.members) === null || _g === void 0 ? void 0 : _g.some(function (m) { var _a, _b; return m.toString() === ((_b = (_a = _this.identity) === null || _a === void 0 ? void 0 : _a.getPrincipal()) === null || _b === void 0 ? void 0 : _b.toString()); })) || false,
                                owner: ((_h = group.owner) === null || _h === void 0 ? void 0 : _h.toString()) || ((_j = group.createdBy) === null || _j === void 0 ? void 0 : _j.toString()) || ''
                            });
                        })];
                    case 6:
                        error_10 = _a.sent();
                        console.error("Error getting study groups:", error_10);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SocialClient.prototype.getAllStudyGroups = function () {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var actor, groups, result, error_11, principalString_1, error_12;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getActor()];
                    case 1:
                        actor = _c.sent();
                        if (!actor)
                            throw new Error("Actor not available");
                        groups = [];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, actor.getMyStudyGroups()];
                    case 3:
                        result = _c.sent();
                        if (Array.isArray(result)) {
                            groups = result;
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_11 = _c.sent();
                        console.warn("getMyStudyGroups not implemented, using empty array");
                        return [3 /*break*/, 5];
                    case 5:
                        principalString_1 = ((_b = (_a = this.identity) === null || _a === void 0 ? void 0 : _a.getPrincipal()) === null || _b === void 0 ? void 0 : _b.toString()) || '';
                        return [2 /*return*/, groups.map(function (group) {
                                var _a, _b, _c, _d, _e, _f;
                                // Convert Principal objects to strings
                                var members = ((_a = group.members) === null || _a === void 0 ? void 0 : _a.map(function (m) { return m.toString(); })) || [];
                                var createdBy = ((_b = group.createdBy) === null || _b === void 0 ? void 0 : _b.toString()) || '';
                                // Convert ns to ms for JavaScript Date compatibility
                                var createdAt = group.createdAt ? Number(group.createdAt / 1000000n) : 0;
                                var lastActivity = group.lastActivity ? Number(group.lastActivity / 1000000n) : createdAt;
                                return {
                                    // Core fields from canister
                                    id: ((_c = group.id) === null || _c === void 0 ? void 0 : _c.toString()) || '',
                                    name: ((_d = group.name) === null || _d === void 0 ? void 0 : _d.toString()) || 'Unnamed Group',
                                    description: ((_e = group.description) === null || _e === void 0 ? void 0 : _e.toString()) || '',
                                    createdBy: createdBy,
                                    members: members,
                                    maxMembers: Number(group.maxMembers || 10),
                                    isPublic: group.isPublic === true,
                                    tags: ((_f = group.tags) === null || _f === void 0 ? void 0 : _f.map(function (t) { return t.toString(); })) || [],
                                    createdAt: group.createdAt || 0n,
                                    lastActivity: group.lastActivity || group.createdAt || 0n,
                                    // Computed fields
                                    memberCount: members.length,
                                    isMember: principalString_1 ? members.includes(principalString_1) : false,
                                    owner: createdBy,
                                    creator: createdBy // Alias for backward compatibility
                                };
                                satisfies;
                                StudyGroup;
                            })];
                    case 6:
                        error_12 = _c.sent();
                        console.error("Error getting all study groups:", error_12);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
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
function createStudyGroup(name, description, isPublic, tags, maxMembers) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.socialClient.createStudyGroup(name, description, isPublic, tags, maxMembers)];
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
