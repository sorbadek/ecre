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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var ProfileProvider_1 = require("../providers/ProfileProvider");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var Title = antd_1.Typography.Title, Text = antd_1.Typography.Text;
var TextArea = antd_1.Input.TextArea;
var TabPane = antd_1.Tabs.TabPane;
var ProfilePage = function () {
    var _a = ProfileProvider_1.useProfile(), profile = _a.profile, isLoading = _a.isLoading, updateProfile = _a.updateProfile, updateProfilePicture = _a.updateProfilePicture, updateCoverPhoto = _a.updateCoverPhoto, addSocialMediaLink = _a.addSocialMediaLink, removeSocialMediaLink = _a.removeSocialMediaLink;
    var form = antd_1.Form.useForm()[0];
    var _b = react_1.useState(false), editing = _b[0], setEditing = _b[1];
    var _c = react_1.useState(false), avatarLoading = _c[0], setAvatarLoading = _c[1];
    var _d = react_1.useState(false), coverLoading = _d[0], setCoverLoading = _d[1];
    var _e = react_1.useState([]), socialLinks = _e[0], setSocialLinks = _e[1];
    var _f = react_1.useState(''), newSocialPlatform = _f[0], setNewSocialPlatform = _f[1];
    var _g = react_1.useState(''), newSocialUrl = _g[0], setNewSocialUrl = _g[1];
    // Initialize form with profile data
    react_1["default"].useEffect(function () {
        if (profile) {
            form.setFieldsValue({
                name: profile.name,
                email: profile.email,
                bio: profile.bio,
                interests: profile.interests.join(', ')
            });
            setSocialLinks(profile.socialLinks || []);
        }
    }, [profile, form]);
    var handleSubmit = function (values) { return __awaiter(void 0, void 0, void 0, function () {
        var updates, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    updates = {
                        name: values.name,
                        email: values.email,
                        bio: values.bio,
                        interests: values.interests.split(',').map(function (i) { return i.trim(); }).filter(Boolean)
                    };
                    return [4 /*yield*/, updateProfile(updates)];
                case 1:
                    _a.sent();
                    antd_1.message.success('Profile updated successfully');
                    setEditing(false);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error updating profile:', error_1);
                    antd_1.message.error('Failed to update profile');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleAvatarChange = function (file) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setAvatarLoading(true);
                    return [4 /*yield*/, updateProfilePicture(file)];
                case 1:
                    _a.sent();
                    antd_1.message.success('Profile picture updated successfully');
                    return [3 /*break*/, 4];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error updating avatar:', error_2);
                    antd_1.message.error('Failed to update profile picture');
                    return [3 /*break*/, 4];
                case 3:
                    setAvatarLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/, false];
            }
        });
    }); };
    var handleCoverChange = function (file) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setCoverLoading(true);
                    return [4 /*yield*/, updateCoverPhoto(file)];
                case 1:
                    _a.sent();
                    antd_1.message.success('Cover photo updated successfully');
                    return [3 /*break*/, 4];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error updating cover photo:', error_3);
                    antd_1.message.error('Failed to update cover photo');
                    return [3 /*break*/, 4];
                case 3:
                    setCoverLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/, false];
            }
        });
    }); };
    var handleAddSocialLink = function () { return __awaiter(void 0, void 0, void 0, function () {
        var success, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newSocialPlatform || !newSocialUrl) {
                        antd_1.message.warning('Please fill in both platform and URL');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, addSocialMediaLink(newSocialPlatform, newSocialUrl)];
                case 2:
                    success = _a.sent();
                    if (success) {
                        setSocialLinks(__spreadArrays(socialLinks, [[newSocialPlatform, newSocialUrl]]));
                        setNewSocialPlatform('');
                        setNewSocialUrl('');
                        antd_1.message.success('Social link added successfully');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error adding social link:', error_4);
                    antd_1.message.error('Failed to add social link');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleRemoveSocialLink = function (platform) { return __awaiter(void 0, void 0, void 0, function () {
        var success, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, removeSocialMediaLink(platform)];
                case 1:
                    success = _a.sent();
                    if (success) {
                        setSocialLinks(socialLinks.filter(function (_a) {
                            var p = _a[0];
                            return p !== platform;
                        }));
                        antd_1.message.success('Social link removed successfully');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error removing social link:', error_5);
                    antd_1.message.error('Failed to remove social link');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var beforeUpload = function (file) {
        var isImage = file.type.startsWith('image/');
        if (!isImage) {
            antd_1.message.error('You can only upload image files!');
            return antd_1.Upload.LIST_IGNORE;
        }
        var isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            antd_1.message.error('Image must be smaller than 5MB!');
            return antd_1.Upload.LIST_IGNORE;
        }
        return isImage && isLt5M;
    };
    if (isLoading && !profile) {
        return react_1["default"].createElement("div", null, "Loading profile...");
    }
    if (!profile) {
        return react_1["default"].createElement("div", null, "No profile found");
    }
    return (react_1["default"].createElement("div", { className: "profile-page" },
        react_1["default"].createElement("div", { className: "relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-6" },
            profile.coverUrl ? (react_1["default"].createElement("img", { src: profile.coverUrl, alt: "Cover", className: "w-full h-full object-cover" })) : (react_1["default"].createElement("div", { className: "w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center" },
                react_1["default"].createElement(Text, { className: "text-white text-xl" }, "Add a cover photo"))),
            react_1["default"].createElement(antd_1.Upload, { name: "cover", showUploadList: false, beforeUpload: beforeUpload, onChange: function (_a) {
                    var file = _a.file;
                    return handleCoverChange(file);
                }, disabled: coverLoading, className: "absolute top-4 right-4" },
                react_1["default"].createElement(antd_1.Button, { icon: react_1["default"].createElement(icons_1.UploadOutlined, null), loading: coverLoading, className: "bg-white bg-opacity-80 hover:bg-opacity-100" }, coverLoading ? 'Uploading...' : 'Change Cover')),
            react_1["default"].createElement("div", { className: "absolute -bottom-16 left-8" },
                react_1["default"].createElement("div", { className: "relative" },
                    react_1["default"].createElement(antd_1.Avatar, { size: 128, src: profile.avatarUrl, icon: react_1["default"].createElement(icons_1.UserOutlined, null), className: "border-4 border-white" }),
                    react_1["default"].createElement(antd_1.Upload, { name: "avatar", showUploadList: false, beforeUpload: beforeUpload, onChange: function (_a) {
                            var file = _a.file;
                            return handleAvatarChange(file);
                        }, disabled: avatarLoading, className: "absolute bottom-0 right-0" },
                        react_1["default"].createElement(antd_1.Button, { shape: "circle", icon: react_1["default"].createElement(icons_1.EditOutlined, null), loading: avatarLoading, className: "shadow-md" }))))),
        react_1["default"].createElement("div", { className: "mt-16 px-4" },
            react_1["default"].createElement("div", { className: "flex justify-between items-start mb-6" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(Title, { level: 2, className: "mb-1" }, profile.name),
                    react_1["default"].createElement(Text, { type: "secondary" }, profile.email),
                    profile.bio && react_1["default"].createElement("div", { className: "mt-2" },
                        react_1["default"].createElement(Text, null, profile.bio))),
                react_1["default"].createElement(antd_1.Button, { type: editing ? 'default' : 'primary', icon: editing ? react_1["default"].createElement("span", null, "Cancel") : react_1["default"].createElement(icons_1.EditOutlined, null), onClick: function () { return setEditing(!editing); } }, editing ? 'Cancel' : 'Edit Profile')),
            react_1["default"].createElement(antd_1.Tabs, { defaultActiveKey: "1" },
                react_1["default"].createElement(TabPane, { tab: "About", key: "1" },
                    react_1["default"].createElement(antd_1.Card, null, editing ? (react_1["default"].createElement(antd_1.Form, { form: form, layout: "vertical", onFinish: handleSubmit, initialValues: {
                            name: profile.name,
                            email: profile.email,
                            bio: profile.bio,
                            interests: profile.interests.join(', ')
                        } },
                        react_1["default"].createElement(antd_1.Form.Item, { name: "name", label: "Full Name", rules: [{ required: true, message: 'Please input your name!' }] },
                            react_1["default"].createElement(antd_1.Input, null)),
                        react_1["default"].createElement(antd_1.Form.Item, { name: "email", label: "Email", rules: [
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' },
                            ] },
                            react_1["default"].createElement(antd_1.Input, { type: "email" })),
                        react_1["default"].createElement(antd_1.Form.Item, { name: "bio", label: "Bio" },
                            react_1["default"].createElement(TextArea, { rows: 4 })),
                        react_1["default"].createElement(antd_1.Form.Item, { name: "interests", label: "Interests (comma-separated)" },
                            react_1["default"].createElement(antd_1.Input, null)),
                        react_1["default"].createElement(antd_1.Form.Item, null,
                            react_1["default"].createElement(antd_1.Button, { type: "primary", htmlType: "submit" }, "Save Changes")))) : (react_1["default"].createElement("div", { className: "space-y-6" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(Title, { level: 5, className: "mb-2" }, "About Me"),
                            react_1["default"].createElement(Text, null, profile.bio || 'No bio provided')),
                        profile.interests && profile.interests.length > 0 && (react_1["default"].createElement("div", null,
                            react_1["default"].createElement(Title, { level: 5, className: "mb-2" }, "Interests"),
                            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, profile.interests.map(function (interest, index) { return (react_1["default"].createElement(antd_1.Tag, { key: index }, interest)); })))))))),
                react_1["default"].createElement(TabPane, { tab: "Social Links", key: "2" },
                    react_1["default"].createElement(antd_1.Card, null,
                        react_1["default"].createElement(Title, { level: 5, className: "mb-4" }, "Social Media Links"),
                        react_1["default"].createElement("div", { className: "mb-6" },
                            react_1["default"].createElement("div", { className: "flex gap-2 mb-4" },
                                react_1["default"].createElement(antd_1.Input, { placeholder: "Platform (e.g., Twitter, GitHub)", value: newSocialPlatform, onChange: function (e) { return setNewSocialPlatform(e.target.value); }, className: "flex-1" }),
                                react_1["default"].createElement(antd_1.Input, { placeholder: "URL", value: newSocialUrl, onChange: function (e) { return setNewSocialUrl(e.target.value); }, className: "flex-1" }),
                                react_1["default"].createElement(antd_1.Button, { type: "primary", icon: react_1["default"].createElement(icons_1.PlusOutlined, null), onClick: handleAddSocialLink }, "Add")),
                            react_1["default"].createElement(antd_1.List, { itemLayout: "horizontal", dataSource: socialLinks, renderItem: function (_a) {
                                    var platform = _a[0], url = _a[1];
                                    return (react_1["default"].createElement(antd_1.List.Item, { actions: [
                                            react_1["default"].createElement(antd_1.Button, { type: "text", danger: true, icon: react_1["default"].createElement(icons_1.DeleteOutlined, null), onClick: function () { return handleRemoveSocialLink(platform); } })
                                        ] },
                                        react_1["default"].createElement(antd_1.List.Item.Meta, { avatar: react_1["default"].createElement(icons_1.LinkOutlined, { className: "text-xl" }), title: react_1["default"].createElement("a", { href: url, target: "_blank", rel: "noopener noreferrer" }, platform), description: url })));
                                } })))),
                react_1["default"].createElement(TabPane, { tab: "Experience & Skills", key: "3" },
                    react_1["default"].createElement(antd_1.Card, null,
                        react_1["default"].createElement(Title, { level: 5, className: "mb-4" }, "Experience & Skills"),
                        react_1["default"].createElement(Text, { type: "secondary" }, "Coming soon")))))));
};
exports["default"] = ProfilePage;
