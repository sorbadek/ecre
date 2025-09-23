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
exports.logout = exports.login = exports.getIdentity = exports.isAuthenticated = exports.withTimeout = exports.createLearningAnalyticsActor = exports.createActor = exports.clearAgentCache = exports.getAgent = exports.initAuthClient = exports.customFetch = exports.AUTH_CONFIG = exports.CANISTER_IDS = exports.CANDID_UI_CANISTER_ID = exports.USER_PROFILE_CANISTER_ID = exports.SOCIAL_CANISTER_ID = exports.SESSIONS_CANISTER_ID = exports.RECOMMENDATIONS_CANISTER_ID = exports.NOTIFICATIONS_CANISTER_ID = exports.LEARNING_ANALYTICS_CANISTER_ID = exports.HOST = void 0;
var agent_1 = require("@dfinity/agent");
var auth_client_1 = require("@dfinity/auth-client");
var learning_analytics_idl_1 = require("@/lib/ic/learning-analytics.idl");
// Configuration
exports.HOST = "https://icp0.io"; // Mainnet IC endpoint
// Canister IDs - Mainnet
exports.LEARNING_ANALYTICS_CANISTER_ID = "g2fo5-yyaaa-aaaap-qqcvq-cai";
exports.NOTIFICATIONS_CANISTER_ID = "gpc7q-zqaaa-aaaap-qqcwa-cai";
exports.RECOMMENDATIONS_CANISTER_ID = "be2us-64aaa-aaaaa-qaabq-cai"; // Update this after deployment
exports.SESSIONS_CANISTER_ID = "gbasy-caaaa-aaaap-qqcxa-cai";
exports.SOCIAL_CANISTER_ID = "ggbum-pyaaa-aaaap-qqcxq-cai";
exports.USER_PROFILE_CANISTER_ID = "lbyh4-cqaaa-aaaap-qqd4a-cai";
// Not needed for mainnet but keeping for reference
exports.CANDID_UI_CANISTER_ID = "by6od-j4aaa-aaaaa-qaadq-cai";
// Mainnet canister IDs
exports.CANISTER_IDS = {
    LEARNING_ANALYTICS: exports.LEARNING_ANALYTICS_CANISTER_ID,
    NOTIFICATIONS: exports.NOTIFICATIONS_CANISTER_ID,
    RECOMMENDATIONS: exports.RECOMMENDATIONS_CANISTER_ID,
    SESSIONS: exports.SESSIONS_CANISTER_ID,
    SOCIAL: exports.SOCIAL_CANISTER_ID,
    USER_PROFILE: exports.USER_PROFILE_CANISTER_ID
    // CANDID_UI is not needed for mainnet
};
var sharedAgent = null;
var currentIdentity = null;
var authClientInstance = null;
// Timeout for API calls (in milliseconds)
var API_TIMEOUT = 10000;
// Auth configuration
exports.AUTH_CONFIG = {
    // 24 hours in nanoseconds
    maxTimeToLive: BigInt(24 * 60 * 60 * 1000 * 1000 * 1000),
    // 5 minutes in nanoseconds
    idleOptions: {
        idleTimeout: 5 * 60 * 1000,
        disableDefaultIdleCallback: true
    }
};
// Custom fetch for direct IC mainnet communication
exports.customFetch = function (input, init) { return __awaiter(void 0, void 0, Promise, function () {
    var requestUrl, headers, requestInit, response, errorText, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                requestUrl = new URL(input.toString());
                headers = new Headers(init === null || init === void 0 ? void 0 : init.headers);
                // Set required headers for IC mainnet
                headers.set('Content-Type', 'application/cbor');
                headers.set('Accept', 'application/cbor');
                requestInit = __assign(__assign({}, init), { headers: headers, mode: 'cors', credentials: 'omit', cache: 'no-store' });
                console.log('Making request to IC mainnet:', requestUrl.toString());
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, fetch(requestUrl.toString(), requestInit)];
            case 2:
                response = _a.sent();
                if (!!response.ok) return [3 /*break*/, 4];
                return [4 /*yield*/, response.text()["catch"](function () { return 'Unknown error'; })];
            case 3:
                errorText = _a.sent();
                throw new Error("IC mainnet error! status: " + response.status + ", message: " + errorText);
            case 4: return [2 /*return*/, response];
            case 5:
                error_1 = _a.sent();
                console.error('IC mainnet fetch error:', error_1);
                throw error_1;
            case 6: return [2 /*return*/];
        }
    });
}); };
// Initialize AuthClient
exports.initAuthClient = function () { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!authClientInstance) return [3 /*break*/, 2];
                return [4 /*yield*/, auth_client_1.AuthClient.create({
                        idleOptions: exports.AUTH_CONFIG.idleOptions
                    })];
            case 1:
                authClientInstance = _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/, authClientInstance];
        }
    });
}); };
// Get or create an agent
exports.getAgent = function (identity) { return __awaiter(void 0, void 0, Promise, function () {
    var agent, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (sharedAgent && !identity) {
                    return [2 /*return*/, sharedAgent];
                }
                agent = new agent_1.HttpAgent({
                    host: exports.HOST,
                    fetch: exports.customFetch
                });
                if (!(process.env.NODE_ENV !== 'production')) return [3 /*break*/, 4];
                console.warn('Running in development mode. For mainnet, ensure NODE_ENV is set to production');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, agent.fetchRootKey()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.warn('Running in mainnet mode. Root key fetch not needed.');
                return [3 /*break*/, 4];
            case 4:
                if (identity) {
                    agent.replaceIdentity(identity);
                }
                if (!identity) {
                    sharedAgent = agent;
                }
                return [2 /*return*/, agent];
        }
    });
}); };
// Clear the cached agent and identity
exports.clearAgentCache = function () {
    sharedAgent = null;
    currentIdentity = null;
    authClientInstance = null;
};
// Create an actor with the given identity
exports.createActor = function (_a) {
    var canisterId = _a.canisterId, idlFactory = _a.idlFactory, identity = _a.identity;
    return __awaiter(void 0, void 0, Promise, function () {
        var agent;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, exports.getAgent(identity)];
                case 1:
                    agent = _b.sent();
                    return [2 /*return*/, agent_1.Actor.createActor(idlFactory, {
                            agent: agent,
                            canisterId: canisterId
                        })];
            }
        });
    });
};
// Create an authenticated actor for the learning analytics canister
exports.createLearningAnalyticsActor = function (identity) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, exports.createActor({
                canisterId: exports.LEARNING_ANALYTICS_CANISTER_ID,
                idlFactory: learning_analytics_idl_1.idlFactory,
                identity: identity
            })];
    });
}); };
// Helper to handle API calls with timeout
exports.withTimeout = function (promise, timeout) {
    if (timeout === void 0) { timeout = API_TIMEOUT; }
    return __awaiter(void 0, void 0, Promise, function () {
        var timeoutPromise;
        return __generator(this, function (_a) {
            timeoutPromise = new Promise(function (_, reject) {
                setTimeout(function () {
                    reject(new Error("Request timed out after " + timeout + "ms"));
                }, timeout);
            });
            return [2 /*return*/, Promise.race([promise, timeoutPromise])];
        });
    });
};
// Check if the user is authenticated
exports.isAuthenticated = function () { return __awaiter(void 0, void 0, Promise, function () {
    var authClient;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.initAuthClient()];
            case 1:
                authClient = _a.sent();
                return [4 /*yield*/, authClient.isAuthenticated()];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
// Get the current identity
exports.getIdentity = function () { return __awaiter(void 0, void 0, Promise, function () {
    var authClient;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.initAuthClient()];
            case 1:
                authClient = _a.sent();
                if (currentIdentity) {
                    return [2 /*return*/, currentIdentity];
                }
                return [4 /*yield*/, authClient.isAuthenticated()];
            case 2:
                if (_a.sent()) {
                    currentIdentity = authClient.getIdentity();
                    return [2 /*return*/, currentIdentity];
                }
                return [2 /*return*/, null];
        }
    });
}); };
// Login function
exports.login = function () { return __awaiter(void 0, void 0, Promise, function () {
    var authClient;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.initAuthClient()];
            case 1:
                authClient = _a.sent();
                return [2 /*return*/, new Promise(function (resolve) {
                        authClient.login(__assign(__assign({}, exports.AUTH_CONFIG), { onSuccess: function () {
                                var identity = authClient.getIdentity();
                                currentIdentity = identity;
                                resolve(identity);
                            }, onError: function (error) {
                                console.error('Login error:', error);
                                resolve(null);
                            } }));
                    })];
        }
    });
}); };
// Logout function
exports.logout = function () { return __awaiter(void 0, void 0, void 0, function () {
    var authClient;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.initAuthClient()];
            case 1:
                authClient = _a.sent();
                return [4 /*yield*/, authClient.logout()];
            case 2:
                _a.sent();
                exports.clearAgentCache();
                return [2 /*return*/];
        }
    });
}); };
// Default export for backward compatibility
exports["default"] = {
    getAgent: exports.getAgent,
    createActor: exports.createActor,
    createLearningAnalyticsActor: exports.createLearningAnalyticsActor,
    withTimeout: exports.withTimeout,
    isAuthenticated: exports.isAuthenticated,
    getIdentity: exports.getIdentity,
    login: exports.login,
    logout: exports.logout,
    clearAgentCache: exports.clearAgentCache,
    HOST: exports.HOST,
    CANISTER_IDS: exports.CANISTER_IDS
};
