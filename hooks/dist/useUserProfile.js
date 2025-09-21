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
exports.useUserProfile = void 0;
var react_1 = require("react");
var profile_client_1 = require("../lib/profile-client");
var auth_context_1 = require("@/lib/auth-context");
function useUserProfile() {
    var _this = this;
    var _a = auth_context_1.useAuth(), isAuthenticated = _a.isAuthenticated, identity = _a.identity;
    var _b = react_1.useState(null), profile = _b[0], setProfile = _b[1];
    var _c = react_1.useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = react_1.useState(null), error = _d[0], setError = _d[1];
    var fetchProfile = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var userProfile, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAuthenticated)
                        return [2 /*return*/];
                    setIsLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, profile_client_1.getMyProfile()];
                case 2:
                    userProfile = _a.sent();
                    setProfile(userProfile);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Failed to fetch profile:', err_1);
                    setError('Failed to load profile');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [isAuthenticated]);
    react_1.useEffect(function () {
        fetchProfile();
    }, [fetchProfile]);
    var updateUserProfile = function (updates) { return __awaiter(_this, void 0, void 0, function () {
        var updatedProfile, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAuthenticated)
                        throw new Error('Not authenticated');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, profile_client_1.updateProfile(updates)];
                case 2:
                    updatedProfile = _a.sent();
                    setProfile(updatedProfile);
                    return [2 /*return*/, updatedProfile];
                case 3:
                    err_2 = _a.sent();
                    console.error('Failed to update profile:', err_2);
                    throw err_2;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var updateProfilePicture = function (file) { return __awaiter(_this, void 0, void 0, function () {
        var avatarUrl, updatedProfile, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAuthenticated)
                        throw new Error('Not authenticated');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, profile_client_1.uploadAvatar(file)];
                case 2:
                    avatarUrl = _a.sent();
                    return [4 /*yield*/, profile_client_1.updateProfile({ avatarUrl: avatarUrl })];
                case 3:
                    updatedProfile = _a.sent();
                    setProfile(updatedProfile);
                    return [2 /*return*/, updatedProfile];
                case 4:
                    err_3 = _a.sent();
                    console.error('Failed to update profile picture:', err_3);
                    throw err_3;
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var updateCoverPhoto = function (file) { return __awaiter(_this, void 0, void 0, function () {
        var coverUrl, updatedProfile, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAuthenticated)
                        throw new Error('Not authenticated');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, profile_client_1.uploadCover(file)];
                case 2:
                    coverUrl = _a.sent();
                    return [4 /*yield*/, profile_client_1.updateProfile({ coverUrl: coverUrl })];
                case 3:
                    updatedProfile = _a.sent();
                    setProfile(updatedProfile);
                    return [2 /*return*/, updatedProfile];
                case 4:
                    err_4 = _a.sent();
                    console.error('Failed to update cover photo:', err_4);
                    throw err_4;
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var addSocialMediaLink = function (platform, url) { return __awaiter(_this, void 0, void 0, function () {
        var success, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAuthenticated)
                        throw new Error('Not authenticated');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, profile_client_1.addSocialLink(platform, url)];
                case 2:
                    success = _a.sent();
                    if (!success) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetchProfile()];
                case 3:
                    _a.sent(); // Refresh profile to get updated social links
                    _a.label = 4;
                case 4: return [2 /*return*/, success];
                case 5:
                    err_5 = _a.sent();
                    console.error('Failed to add social link:', err_5);
                    throw err_5;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var removeSocialMediaLink = function (platform) { return __awaiter(_this, void 0, void 0, function () {
        var success, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAuthenticated)
                        throw new Error('Not authenticated');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, profile_client_1.removeSocialLink(platform)];
                case 2:
                    success = _a.sent();
                    if (!success) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetchProfile()];
                case 3:
                    _a.sent(); // Refresh profile to get updated social links
                    _a.label = 4;
                case 4: return [2 /*return*/, success];
                case 5:
                    err_6 = _a.sent();
                    console.error('Failed to remove social link:', err_6);
                    throw err_6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var awardXP = function (amount, reason, metadata) {
        if (metadata === void 0) { metadata = ''; }
        return __awaiter(_this, void 0, void 0, function () {
            var newBalance, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isAuthenticated)
                            throw new Error('Not authenticated');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, profile_client_1.addXP(amount, reason, metadata)];
                    case 2:
                        newBalance = _a.sent();
                        // Refresh profile to get updated XP balance
                        return [4 /*yield*/, fetchProfile()];
                    case 3:
                        // Refresh profile to get updated XP balance
                        _a.sent();
                        return [2 /*return*/, newBalance];
                    case 4:
                        err_7 = _a.sent();
                        console.error('Failed to award XP:', err_7);
                        throw err_7;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return {
        profile: profile,
        isLoading: isLoading,
        error: error,
        refresh: fetchProfile,
        updateProfile: updateUserProfile,
        updateProfilePicture: updateProfilePicture,
        updateCoverPhoto: updateCoverPhoto,
        addSocialMediaLink: addSocialMediaLink,
        removeSocialMediaLink: removeSocialMediaLink,
        awardXP: awardXP
    };
}
exports.useUserProfile = useUserProfile;
