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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.uploadAndLinkFile = exports.getXPTransactions = exports.spendXP = exports.addXP = exports.removeSocialLink = exports.addSocialLink = exports.uploadCover = exports.uploadAvatar = exports.uploadFile = exports.updateMyProfile = exports.updateProfile = exports.getProfile = exports.getMyProfile = exports.createProfile = void 0;
var agent_1 = require("@dfinity/agent");
var user_profile_idl_1 = require("./ic/user-profile.idl");
var principal_1 = require("@dfinity/principal");
var auth_client_1 = require("@dfinity/auth-client");
var CANISTER_ID = process.env.NEXT_PUBLIC_USER_PROFILE_CANISTER_ID;
var HOST = process.env.NEXT_PUBLIC_IC_HOST || 'https://ic0.app';
if (!CANISTER_ID) {
    throw new Error('NEXT_PUBLIC_USER_PROFILE_CANISTER_ID environment variable is not set');
}
// Helper function to get the canister ID as a string or Principal
var getCanisterId = function () {
    if (!CANISTER_ID) {
        throw new Error('CANISTER_ID is not defined');
    }
    try {
        return principal_1.Principal.fromText(CANISTER_ID);
    }
    catch (e) {
        return CANISTER_ID;
    }
};
var userProfileActor = null;
function getActor() {
    return __awaiter(this, void 0, Promise, function () {
        var authClient, identity, principal, agent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (userProfileActor)
                        return [2 /*return*/, userProfileActor];
                    return [4 /*yield*/, auth_client_1.AuthClient.create()];
                case 1:
                    authClient = _a.sent();
                    identity = authClient.getIdentity();
                    if (!identity) {
                        throw new Error('Not authenticated');
                    }
                    principal = identity.getPrincipal();
                    agent = new agent_1.HttpAgent({
                        host: HOST,
                        identity: authClient.getIdentity()
                    });
                    if (!(process.env.NODE_ENV !== 'production')) return [3 /*break*/, 3];
                    return [4 /*yield*/, agent.fetchRootKey()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, agent_1.Actor.createActor(user_profile_idl_1.idlFactory, {
                        agent: agent,
                        canisterId: getCanisterId()
                    })];
            }
        });
    });
}
// Helper function to safely convert BigInt to number
var bigIntToNumber = function (value) {
    if (typeof value === 'bigint') {
        return Number(value);
    }
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        var num = Number(value);
        return isNaN(num) ? 0 : num;
    }
    return 0;
};
// Helper function to safely log objects that might contain BigInt
var safeStringify = function (obj) {
    var bigIntReplacer = function (key, value) {
        return typeof value === 'bigint' ? value.toString() : value;
    };
    return JSON.stringify(obj, bigIntReplacer, 2);
};
// Helper function to convert backend profile to frontend profile
function mapBackendToFrontendProfile(profile) {
    // Log the profile in a way that handles BigInt
    console.log('Mapping backend profile:', safeStringify(profile));
    // Helper function to safely get a setting value
    var getSetting = function (value, defaultValue) {
        if (value === undefined || value === null)
            return defaultValue;
        return Array.isArray(value) ? value[0] : value;
    };
    // Helper function to safely get a value that might be wrapped in an array
    var unwrapValue = function (value) {
        if (value === undefined || value === null)
            return undefined;
        return Array.isArray(value) ? value[0] : value;
    };
    // Safely get settings with defaults
    var settings = profile.settings ? (Array.isArray(profile.settings) ? profile.settings[0] : profile.settings) : {};
    // Process interests - ensure it's always an array of strings
    var interests = [];
    if (Array.isArray(profile.interests)) {
        interests.push.apply(interests, profile.interests.flat().filter(function (i) { return typeof i === 'string'; }));
    }
    else if (profile.interests) {
        interests.push(String(profile.interests));
    }
    // Process social links - ensure it's an array of [string, string] tuples
    var socialLinks = [];
    // Type guard to check if a value is a valid social link tuple
    var isValidSocialLink = function (value) {
        return Array.isArray(value) &&
            value.length === 2 &&
            typeof value[0] === 'string' &&
            typeof value[1] === 'string';
    };
    if (profile.socialLinks) {
        // Handle case where socialLinks is an array of arrays
        if (Array.isArray(profile.socialLinks)) {
            for (var _i = 0, _a = profile.socialLinks.flat(); _i < _a.length; _i++) {
                var item = _a[_i];
                if (isValidSocialLink(item)) {
                    socialLinks.push([item[0], item[1]]);
                }
                else if (Array.isArray(item)) {
                    // Handle nested arrays
                    var flatItem = item.flat();
                    if (isValidSocialLink(flatItem)) {
                        socialLinks.push([flatItem[0], flatItem[1]]);
                    }
                }
            }
        }
        // Handle case where socialLinks is a single tuple
        else if (isValidSocialLink(profile.socialLinks)) {
            socialLinks.push([profile.socialLinks[0], profile.socialLinks[1]]);
        }
    }
    // Process files
    var files = [];
    if (Array.isArray(profile.files)) {
        for (var _b = 0, _c = profile.files; _b < _c.length; _b++) {
            var file = _c[_b];
            if (file) {
                files.push({
                    id: file.id || '',
                    filename: file.filename || '',
                    contentType: file.contentType || '',
                    size: bigIntToNumber(file.size),
                    url: file.url || '',
                    category: file.category || 'other',
                    uploadedAt: bigIntToNumber(file.uploadedAt),
                    tags: Array.isArray(file.tags) ? file.tags.filter(function (t) { return typeof t === 'string'; }) : []
                });
            }
        }
    }
    var frontendProfile = {
        id: profile.id,
        name: unwrapValue(profile.name) || '',
        email: unwrapValue(profile.email) || '',
        bio: unwrapValue(profile.bio) || '',
        avatarUrl: unwrapValue(profile.avatarUrl) || '',
        coverUrl: unwrapValue(profile.coverUrl) || '',
        xpBalance: bigIntToNumber(profile.xpBalance),
        reputation: bigIntToNumber(profile.reputation),
        interests: interests,
        socialLinks: socialLinks,
        files: files,
        createdAt: Number(profile.createdAt || Date.now()),
        updatedAt: Number(profile.updatedAt || Date.now()),
        settings: {
            notifications: getSetting(settings.notifications !== undefined ? settings.notifications : settings.notifications, true),
            emailNotifications: getSetting(settings.emailNotifications !== undefined ? settings.emailNotifications : settings.emailNotifications, true),
            privacy: getSetting(settings.privacy !== undefined ? settings.privacy : settings.privacy, 'public'),
            theme: getSetting(settings.theme !== undefined ? settings.theme : settings.theme, 'light'),
            language: getSetting(settings.language !== undefined ? settings.language : settings.language, 'en'),
            profileVisibility: getSetting(settings.profileVisibility !== undefined ? settings.profileVisibility : settings.profileVisibility, 'public')
        }
    };
    return frontendProfile;
}
// Profile Management
function createProfile(name, email) {
    return __awaiter(this, void 0, Promise, function () {
        var existingProfile, error_1, actor, result, profile, existingProfile, existingProfile, error_2, existingProfile, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getMyProfile()];
                case 1:
                    existingProfile = _a.sent();
                    if (existingProfile) {
                        console.log('Profile already exists, returning existing profile');
                        return [2 /*return*/, existingProfile];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.log('No existing profile found, creating new one');
                    return [3 /*break*/, 3];
                case 3:
                    _a.trys.push([3, 12, , 17]);
                    return [4 /*yield*/, getActor()];
                case 4:
                    actor = _a.sent();
                    return [4 /*yield*/, actor.createProfile(name, email)];
                case 5:
                    result = _a.sent();
                    console.log('Create profile result:', JSON.stringify(result, null, 2));
                    if (!(result && 'ok' in result)) return [3 /*break*/, 6];
                    profile = result.ok;
                    return [2 /*return*/, mapBackendToFrontendProfile(profile)];
                case 6:
                    if (!(result && 'err' in result)) return [3 /*break*/, 9];
                    if (!(typeof result.err === 'string' && result.err.toLowerCase().includes('already exists'))) return [3 /*break*/, 8];
                    return [4 /*yield*/, getMyProfile()];
                case 7:
                    existingProfile = _a.sent();
                    if (existingProfile) {
                        return [2 /*return*/, existingProfile];
                    }
                    _a.label = 8;
                case 8: throw new Error(typeof result.err === 'string' ? result.err : 'Failed to create profile');
                case 9:
                    console.warn('Unexpected response format from createProfile, trying to get profile...');
                    return [4 /*yield*/, getMyProfile()];
                case 10:
                    existingProfile = _a.sent();
                    if (existingProfile) {
                        return [2 /*return*/, existingProfile];
                    }
                    throw new Error('Unexpected response format from createProfile');
                case 11: return [3 /*break*/, 17];
                case 12:
                    error_2 = _a.sent();
                    console.error('Error in createProfile:', error_2);
                    _a.label = 13;
                case 13:
                    _a.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, getMyProfile()];
                case 14:
                    existingProfile = _a.sent();
                    if (existingProfile) {
                        return [2 /*return*/, existingProfile];
                    }
                    return [3 /*break*/, 16];
                case 15:
                    e_1 = _a.sent();
                    console.error('Failed to get profile after create error:', e_1);
                    return [3 /*break*/, 16];
                case 16: 
                // Re-throw the original error if we couldn't recover
                throw error_2;
                case 17: return [2 /*return*/];
            }
        });
    });
}
exports.createProfile = createProfile;
function getMyProfile() {
    return __awaiter(this, void 0, Promise, function () {
        var actor, result, firstItem, profile, profile, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getActor()];
                case 1:
                    actor = _a.sent();
                    return [4 /*yield*/, actor.getMyProfile()];
                case 2:
                    result = _a.sent();
                    if (!result) {
                        console.warn('Empty response from getMyProfile');
                        return [2 /*return*/, null];
                    }
                    // Handle case where result is an array with one element
                    if (Array.isArray(result) && result.length > 0) {
                        firstItem = result[0];
                        // If the first item is an object with 'ok' or 'err', handle it
                        if (firstItem && typeof firstItem === 'object') {
                            if ('ok' in firstItem) {
                                profile = firstItem.ok;
                                return [2 /*return*/, mapBackendToFrontendProfile(profile)];
                            }
                            else if ('err' in firstItem) {
                                console.error('Error in profile response:', firstItem.err);
                                return [2 /*return*/, null];
                            }
                        }
                        // If the first item looks like a profile, try to map it
                        if (firstItem && 'id' in firstItem) {
                            return [2 /*return*/, mapBackendToFrontendProfile(firstItem)];
                        }
                    }
                    // Handle case where result is an object with 'ok' or 'err' property
                    if (typeof result === 'object' && result !== null) {
                        if ('ok' in result) {
                            profile = result.ok;
                            return [2 /*return*/, mapBackendToFrontendProfile(profile)];
                        }
                        else if ('err' in result) {
                            console.error('Error fetching profile:', result.err);
                            return [2 /*return*/, null];
                        }
                    }
                    // If we get here, the result is in an unexpected format
                    console.warn('Unexpected profile response format, attempting to parse anyway:', result);
                    // Last resort: try to map the result directly if it looks like a profile
                    if (result && typeof result === 'object' && 'id' in result) {
                        return [2 /*return*/, mapBackendToFrontendProfile(result)];
                    }
                    return [2 /*return*/, null];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error fetching profile:', error_3);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getMyProfile = getMyProfile;
function getProfile(principal) {
    return __awaiter(this, void 0, Promise, function () {
        var actor, principalObj, result, firstItem, profile, profile, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getActor()];
                case 1:
                    actor = _a.sent();
                    principalObj = typeof principal === 'string'
                        ? principal_1.Principal.fromText(principal)
                        : principal;
                    return [4 /*yield*/, actor.getProfile({ user: principalObj })];
                case 2:
                    result = _a.sent();
                    if (!result) {
                        console.warn('Empty response from getProfile');
                        return [2 /*return*/, null];
                    }
                    // Handle case where result is an array with one element
                    if (Array.isArray(result) && result.length > 0) {
                        firstItem = result[0];
                        // If the first item is an object with 'ok' or 'err', handle it
                        if (firstItem && typeof firstItem === 'object') {
                            if ('ok' in firstItem) {
                                profile = firstItem.ok;
                                return [2 /*return*/, mapBackendToFrontendProfile(profile)];
                            }
                            else if ('err' in firstItem) {
                                console.error('Error in profile response:', firstItem.err);
                                return [2 /*return*/, null];
                            }
                        }
                        // If the first item looks like a profile, try to map it
                        if ('id' in firstItem) {
                            return [2 /*return*/, mapBackendToFrontendProfile(firstItem)];
                        }
                    }
                    // Handle case where result is an object with 'ok' or 'err' property
                    if (typeof result === 'object' && result !== null) {
                        if ('ok' in result) {
                            profile = result.ok;
                            return [2 /*return*/, mapBackendToFrontendProfile(profile)];
                        }
                        else if ('err' in result) {
                            console.error('Error fetching profile:', result.err);
                            return [2 /*return*/, null];
                        }
                    }
                    // If we get here, the result is in an unexpected format
                    console.warn('Unexpected profile response format, attempting to parse anyway:', result);
                    // Last resort: try to map the result directly if it looks like a profile
                    if (result && typeof result === 'object' && 'id' in result) {
                        return [2 /*return*/, mapBackendToFrontendProfile(result)];
                    }
                    return [2 /*return*/, null];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error fetching profile:', error_4);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getProfile = getProfile;
function updateProfile(updates) {
    var _a, _b;
    return __awaiter(this, void 0, Promise, function () {
        var actor, currentProfile, currentSettings, getOptionalString, getOptionalText, updateData, result, errorMessage, error_5;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getActor()];
                case 1:
                    actor = _c.sent();
                    return [4 /*yield*/, getMyProfile()];
                case 2:
                    currentProfile = _c.sent();
                    if (!currentProfile) {
                        throw new Error('Cannot update profile: no existing profile found');
                    }
                    currentSettings = currentProfile.settings || {
                        notifications: true,
                        emailNotifications: true,
                        privacy: 'public',
                        theme: 'light',
                        language: 'en',
                        profileVisibility: 'public'
                    };
                    getOptionalString = function (value) {
                        return value && value.trim() !== '' ? value : undefined;
                    };
                    getOptionalText = function (value) {
                        return value && value.trim() !== '' ? value : '';
                    };
                    updateData = __assign(__assign(__assign(__assign(__assign({ 
                        // Always include required fields
                        name: updates.name !== undefined ? updates.name : currentProfile.name, email: updates.email !== undefined ? updates.email : currentProfile.email, 
                        // Handle optional fields - ensure they're never undefined
                        bio: updates.bio !== undefined ? getOptionalText(updates.bio) : getOptionalText(currentProfile.bio) }, (updates.avatarUrl !== undefined ? { avatarUrl: getOptionalText(updates.avatarUrl) } : { avatarUrl: getOptionalText(currentProfile.avatarUrl) })), (updates.coverUrl !== undefined ? { coverUrl: getOptionalText(updates.coverUrl) } : { coverUrl: getOptionalText(currentProfile.coverUrl) })), (updates.interests !== undefined
                        ? { interests: Array.isArray(updates.interests) && updates.interests.length > 0 ? updates.interests : undefined }
                        : { interests: ((_a = currentProfile.interests) === null || _a === void 0 ? void 0 : _a.length) ? __spreadArrays(currentProfile.interests) : undefined })), (updates.socialLinks !== undefined
                        ? { socialLinks: Array.isArray(updates.socialLinks) && updates.socialLinks.length > 0 ? updates.socialLinks : undefined }
                        : { socialLinks: ((_b = currentProfile.socialLinks) === null || _b === void 0 ? void 0 : _b.length) ? __spreadArrays(currentProfile.socialLinks) : undefined })), (updates.settings ? { settings: updates.settings } : { settings: currentSettings }));
                    // Log the data being sent for debugging
                    console.log('Sending profile update with data:', {
                        name: updateData.name,
                        email: updateData.email,
                        bio: updateData.bio,
                        avatarUrl: updateData.avatarUrl,
                        coverUrl: updateData.coverUrl,
                        interests: updateData.interests,
                        socialLinks: updateData.socialLinks,
                        settings: updateData.settings
                    });
                    // Handle settings - merge with existing settings if provided
                    if (updates.settings) {
                        updateData.settings = __assign(__assign({}, updateData.settings), updates.settings // Apply updates
                        );
                    }
                    console.log('Sending profile update with data:', JSON.stringify(updateData, null, 2));
                    console.log('Sending profile update with all required fields');
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    console.log('Calling updateProfile with:', JSON.stringify(updateData, null, 2));
                    return [4 /*yield*/, actor.updateProfile(updateData)];
                case 4:
                    result = _c.sent();
                    if ('ok' in result) {
                        return [2 /*return*/, mapBackendToFrontendProfile(result.ok)];
                    }
                    else {
                        errorMessage = typeof result.err === 'string' ? result.err : 'Failed to update profile';
                        console.error('Error updating profile:', errorMessage);
                        throw new Error(errorMessage);
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_5 = _c.sent();
                    console.error('Error in updateProfile call:', error_5);
                    throw error_5;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.updateProfile = updateProfile;
function updateMyProfile(updates) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, updateProfile(updates)];
        });
    });
}
exports.updateMyProfile = updateMyProfile;
// File Management
function uploadFile(file, category) {
    if (category === void 0) { category = 'other'; }
    return __awaiter(this, void 0, Promise, function () {
        var actor, arrayBuffer, fileBytes, tags, result, backendFile, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getActor()];
                case 1:
                    actor = _a.sent();
                    return [4 /*yield*/, file.arrayBuffer()];
                case 2:
                    arrayBuffer = _a.sent();
                    fileBytes = new Uint8Array(arrayBuffer);
                    tags = [];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, actor.uploadFile(file.name, file.type, BigInt(file.size), category, '', // URL can be empty initially
                        tags)];
                case 4:
                    result = _a.sent();
                    if ('ok' in result) {
                        backendFile = result.ok;
                        return [2 /*return*/, {
                                id: backendFile.id,
                                filename: backendFile.filename,
                                contentType: backendFile.contentType,
                                size: Number(backendFile.size),
                                url: backendFile.url,
                                category: backendFile.category,
                                uploadedAt: Number(backendFile.uploadedAt),
                                tags: backendFile.tags || []
                            }];
                    }
                    else {
                        throw new Error(result.err);
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_6 = _a.sent();
                    console.error('Error uploading file:', error_6);
                    throw error_6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.uploadFile = uploadFile;
function uploadAvatar(file) {
    return __awaiter(this, void 0, Promise, function () {
        var uploadedFile, currentProfile, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    console.log('Starting avatar image upload...');
                    return [4 /*yield*/, uploadFile(file, 'avatar')];
                case 1:
                    uploadedFile = _a.sent();
                    console.log('File uploaded, updating profile with avatar URL:', uploadedFile.url);
                    return [4 /*yield*/, getMyProfile()];
                case 2:
                    currentProfile = _a.sent();
                    if (!currentProfile) {
                        throw new Error('Failed to load current profile');
                    }
                    // Update profile with all required fields
                    return [4 /*yield*/, updateProfile(__assign(__assign({}, currentProfile), { avatarUrl: uploadedFile.url // Update just the avatar URL
                         }))];
                case 3:
                    // Update profile with all required fields
                    _a.sent();
                    console.log('Profile updated successfully with new avatar image');
                    return [2 /*return*/, uploadedFile.url];
                case 4:
                    error_7 = _a.sent();
                    console.error('Error in uploadAvatar:', error_7);
                    throw error_7;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.uploadAvatar = uploadAvatar;
function uploadCover(file) {
    return __awaiter(this, void 0, Promise, function () {
        var uploadedFile, currentProfile, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    console.log('Starting cover image upload...');
                    return [4 /*yield*/, uploadFile(file, 'cover')];
                case 1:
                    uploadedFile = _a.sent();
                    console.log('File uploaded, updating profile with cover URL:', uploadedFile.url);
                    return [4 /*yield*/, getMyProfile()];
                case 2:
                    currentProfile = _a.sent();
                    if (!currentProfile) {
                        throw new Error('Failed to load current profile');
                    }
                    // Update profile with all required fields
                    return [4 /*yield*/, updateProfile(__assign(__assign({}, currentProfile), { coverUrl: uploadedFile.url // Update just the cover URL
                         }))];
                case 3:
                    // Update profile with all required fields
                    _a.sent();
                    console.log('Profile updated successfully with new cover image');
                    return [2 /*return*/, uploadedFile.url];
                case 4:
                    error_8 = _a.sent();
                    console.error('Error in uploadCover:', error_8);
                    throw error_8;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.uploadCover = uploadCover;
// Social Links
function addSocialLink(platform, url) {
    return __awaiter(this, void 0, Promise, function () {
        var actor, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getActor()];
                case 1:
                    actor = _a.sent();
                    return [4 /*yield*/, actor.addSocialLink(platform, url)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, 'ok' in result && result.ok];
            }
        });
    });
}
exports.addSocialLink = addSocialLink;
function removeSocialLink(platform) {
    return __awaiter(this, void 0, Promise, function () {
        var actor, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getActor()];
                case 1:
                    actor = _a.sent();
                    return [4 /*yield*/, actor.removeSocialLink(platform)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, 'ok' in result && result.ok];
            }
        });
    });
}
exports.removeSocialLink = removeSocialLink;
// XP Management
function addXP(amount, reason, metadata) {
    if (metadata === void 0) { metadata = ''; }
    return __awaiter(this, void 0, Promise, function () {
        var actor, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getActor()];
                case 1:
                    actor = _a.sent();
                    return [4 /*yield*/, actor.addXP(BigInt(amount), reason, metadata)];
                case 2:
                    result = _a.sent();
                    if ('ok' in result) {
                        return [2 /*return*/, Number(result.ok)];
                    }
                    else {
                        throw new Error(result.err);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.addXP = addXP;
function spendXP(amount, reason, metadata) {
    if (metadata === void 0) { metadata = ''; }
    return __awaiter(this, void 0, Promise, function () {
        var actor, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getActor()];
                case 1:
                    actor = _a.sent();
                    return [4 /*yield*/, actor.spendXP(BigInt(amount), reason, metadata)];
                case 2:
                    result = _a.sent();
                    if ('ok' in result) {
                        return [2 /*return*/, Number(result.ok)];
                    }
                    else {
                        throw new Error(result.err);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.spendXP = spendXP;
function getXPTransactions() {
    return __awaiter(this, void 0, Promise, function () {
        var actor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getActor()];
                case 1:
                    actor = _a.sent();
                    return [4 /*yield*/, actor.getMyXPTransactions()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getXPTransactions = getXPTransactions;
function uploadAndLinkFile(file, category, tags) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            console.warn('Profile client temporarily disabled');
            return [2 /*return*/, null];
        });
    });
}
exports.uploadAndLinkFile = uploadAndLinkFile;
