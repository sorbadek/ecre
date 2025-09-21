"use client";
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
var react_1 = require("react");
var auth_context_1 = require("@/lib/auth-context");
var button_1 = require("@/components/ui/button");
var avatar_1 = require("@/components/ui/avatar");
var tabs_1 = require("@/components/ui/tabs");
var use_toast_1 = require("@/components/ui/use-toast");
var lucide_react_1 = require("lucide-react");
var profile_client_1 = require("@/lib/profile-client");
function ProfilePage() {
    var _this = this;
    var _a, _b, _c;
    var user = auth_context_1.useAuth().user;
    var _d = react_1.useState(true), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useState(false), editing = _e[0], setEditing = _e[1];
    var _f = react_1.useState({
        name: "",
        bio: "",
        location: "",
        jobTitle: "",
        company: "",
        education: "",
        avatarUrl: "",
        coverUrl: "",
        skills: [],
        interests: []
    }), profile = _f[0], setProfile = _f[1];
    var loadProfile = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var userProfile, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, profile_client_1.getMyProfile()];
                case 2:
                    userProfile = _a.sent();
                    setProfile(userProfile);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    use_toast_1.toast({
                        title: "Error",
                        description: "Failed to load profile",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [user]);
    react_1.useEffect(function () {
        loadProfile();
    }, [loadProfile]);
    if (loading) {
        return React.createElement("div", { className: "flex justify-center p-8" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }));
    }
    return (React.createElement("div", { className: "container mx-auto px-4 py-8" },
        React.createElement("div", { className: "relative h-48 bg-muted rounded-lg overflow-hidden mb-6" }, profile.coverUrl ? (React.createElement("img", { src: profile.coverUrl, alt: "Cover", className: "w-full h-full object-cover" })) : (React.createElement("div", { className: "w-full h-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center" },
            React.createElement(lucide_react_1.Globe, { className: "h-12 w-12 text-muted-foreground/30" })))),
        React.createElement("div", { className: "flex flex-col md:flex-row md:items-end md:justify-between -mt-16 px-6 relative z-10" },
            React.createElement("div", { className: "flex items-end space-x-6" },
                React.createElement("div", { className: "relative group" },
                    React.createElement(avatar_1.Avatar, { className: "h-32 w-32 border-4 border-background" },
                        React.createElement(avatar_1.AvatarImage, { src: profile.avatarUrl, alt: profile.name }),
                        React.createElement(avatar_1.AvatarFallback, { className: "text-3xl" }, (_a = profile.name) === null || _a === void 0 ? void 0 : _a.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase()))),
                React.createElement("div", { className: "pb-4" },
                    React.createElement("h1", { className: "text-2xl font-bold" }, profile.name),
                    React.createElement("p", { className: "text-muted-foreground" }, profile.jobTitle || 'No title'),
                    React.createElement("div", { className: "flex items-center space-x-2 mt-2" }, profile.location && (React.createElement("div", { className: "flex items-center text-sm text-muted-foreground" },
                        React.createElement(lucide_react_1.MapPin, { className: "h-4 w-4 mr-1" }),
                        profile.location))))),
            React.createElement("div", { className: "mt-4 md:mt-0" },
                React.createElement(button_1.Button, { onClick: function () { return setEditing(!editing); } },
                    React.createElement(lucide_react_1.Edit3, { className: "h-4 w-4 mr-2" }),
                    editing ? 'Cancel' : 'Edit Profile'))),
        React.createElement("div", { className: "mt-8" },
            React.createElement(tabs_1.Tabs, { defaultValue: "about", className: "w-full" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "about" }, "About"),
                    React.createElement(tabs_1.TabsTrigger, { value: "skills" }, "Skills"),
                    React.createElement(tabs_1.TabsTrigger, { value: "interests" }, "Interests")),
                React.createElement(tabs_1.TabsContent, { value: "about", className: "mt-6" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("h3", { className: "font-semibold" }, "Bio"),
                            React.createElement("p", { className: "text-muted-foreground" }, profile.bio || 'No bio provided')),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            profile.company && (React.createElement("div", { className: "flex items-center" },
                                React.createElement(lucide_react_1.Briefcase, { className: "h-5 w-5 mr-2 text-muted-foreground" }),
                                React.createElement("span", null, profile.company))),
                            profile.education && (React.createElement("div", { className: "flex items-center" },
                                React.createElement(lucide_react_1.GraduationCap, { className: "h-5 w-5 mr-2 text-muted-foreground" }),
                                React.createElement("span", null, profile.education)))))),
                React.createElement(tabs_1.TabsContent, { value: "skills", className: "mt-6" },
                    React.createElement("div", { className: "flex flex-wrap gap-2" }, ((_b = profile.skills) === null || _b === void 0 ? void 0 : _b.length) > 0 ? (profile.skills.map(function (skill, index) { return (React.createElement("div", { key: index, className: "bg-secondary px-3 py-1 rounded-full text-sm" }, skill)); })) : (React.createElement("p", { className: "text-muted-foreground" }, "No skills added yet")))),
                React.createElement(tabs_1.TabsContent, { value: "interests", className: "mt-6" },
                    React.createElement("div", { className: "flex flex-wrap gap-2" }, ((_c = profile.interests) === null || _c === void 0 ? void 0 : _c.length) > 0 ? (profile.interests.map(function (interest, index) { return (React.createElement("div", { key: index, className: "bg-secondary px-3 py-1 rounded-full text-sm" }, interest)); })) : (React.createElement("p", { className: "text-muted-foreground" }, "No interests added yet"))))))));
}
exports["default"] = ProfilePage;
