"use client";
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
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var use_api_clients_1 = require("@/lib/hooks/use-api-clients");
var sessionSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters'),
    sessionType: z["enum"](['video', 'voice', 'screen_share', 'webinar']),
    scheduledDate: z.string().min(1, 'Date is required'),
    scheduledTime: z.string().min(1, 'Time is required'),
    duration: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
    maxAttendees: z.number().min(2, 'Must allow at least 2 attendees').max(100, 'Cannot exceed 100 attendees'),
    tags: z.array(z.string()).max(10, 'Cannot have more than 10 tags'),
    isRecordingEnabled: z.boolean(),
    // Jitsi configuration
    startWithAudioMuted: z.boolean(),
    startWithVideoMuted: z.boolean(),
    enableScreenSharing: z.boolean(),
    enableChat: z.boolean(),
    requireModerator: z.boolean()
});
var CreateSessionForm = function (_a) {
    var onSuccess = _a.onSuccess, onCancel = _a.onCancel;
    var _b = react_1.useState(false), isSubmitting = _b[0], setIsSubmitting = _b[1];
    var _c = react_1.useState(''), currentTag = _c[0], setCurrentTag = _c[1];
    var _d = use_api_clients_1.useApiClients(), isAuthenticated = _d.isAuthenticated, user = _d.user, sessionClient = _d.sessionClient;
    var _e = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(sessionSchema),
        defaultValues: {
            title: '',
            description: '',
            sessionType: 'video',
            scheduledDate: '',
            scheduledTime: '',
            duration: 60,
            maxAttendees: 10,
            tags: [],
            isRecordingEnabled: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableScreenSharing: true,
            enableChat: true,
            requireModerator: false
        }
    }), register = _e.register, handleSubmit = _e.handleSubmit, watch = _e.watch, setValue = _e.setValue, errors = _e.formState.errors, reset = _e.reset;
    var watchedValues = watch();
    var sessionTypeOptions = [
        { value: 'video', label: 'Video Call', icon: lucide_react_1.Video, description: 'Full video conference with camera and audio' },
        { value: 'voice', label: 'Voice Call', icon: lucide_react_1.Mic, description: 'Audio-only conference call' },
        { value: 'screen_share', label: 'Screen Share', icon: lucide_react_1.Monitor, description: 'Screen sharing session with video/audio' },
        { value: 'webinar', label: 'Webinar', icon: lucide_react_1.Settings, description: 'Large presentation-style session' },
    ];
    var addTag = function () {
        if (currentTag.trim() && !watchedValues.tags.includes(currentTag.trim())) {
            var newTags = __spreadArrays(watchedValues.tags, [currentTag.trim()]);
            setValue('tags', newTags);
            setCurrentTag('');
        }
    };
    var removeTag = function (tagToRemove) {
        var newTags = watchedValues.tags.filter(function (tag) { return tag !== tagToRemove; });
        setValue('tags', newTags);
    };
    var onSubmit = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var scheduledDateTime, scheduledTimeNs, sessionInput, session, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!isAuthenticated || !user) {
                        sonner_1.toast.error('Please authenticate first');
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    scheduledDateTime = new Date(data.scheduledDate + "T" + data.scheduledTime);
                    scheduledTimeNs = BigInt(scheduledDateTime.getTime()) * 1000000n;
                    sessionInput = {
                        title: data.title,
                        description: data.description || '',
                        sessionType: (_a = {}, _a[data.sessionType] = null, _a),
                        scheduledTime: scheduledTimeNs,
                        duration: BigInt(data.duration * 60),
                        maxAttendees: BigInt(data.maxAttendees),
                        hostName: user.email || 'Anonymous',
                        hostAvatar: user.avatar || '',
                        tags: data.tags || [],
                        isRecordingEnabled: data.isRecordingEnabled || false,
                        recordSession: data.isRecordingEnabled || false,
                        jitsiConfig: [{
                                roomName: "peer-" + Date.now(),
                                displayName: user.email || 'Anonymous',
                                email: user.email ? [user.email] : [],
                                avatarUrl: user.avatar ? [user.avatar] : [],
                                moderator: true,
                                startWithAudioMuted: data.startWithAudioMuted || false,
                                startWithVideoMuted: data.startWithVideoMuted || false,
                                enableRecording: data.isRecordingEnabled || false,
                                enableScreenSharing: data.enableScreenSharing !== false,
                                enableChat: data.enableChat !== false,
                                maxParticipants: data.maxAttendees ? [BigInt(data.maxAttendees)] : []
                            }],
                        isPrivate: data.isPrivate || false
                    };
                    return [4 /*yield*/, sessionClient.createSession(sessionInput)];
                case 2:
                    session = _b.sent();
                    sonner_1.toast.success('Session created successfully!');
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error creating session:', error_1);
                    sonner_1.toast.error("Failed to create session: " + (error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getMinDateTime = function () {
        var now = new Date();
        now.setMinutes(now.getMinutes() + 15); // Minimum 15 minutes from now
        return now.toISOString().slice(0, 16);
    };
    return (react_1["default"].createElement(card_1.Card, { className: "w-full max-w-2xl mx-auto" },
        react_1["default"].createElement(card_1.CardHeader, null,
            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center space-x-2" },
                react_1["default"].createElement(lucide_react_1.Plus, { className: "h-5 w-5" }),
                react_1["default"].createElement("span", null, "Create New Session"))),
        react_1["default"].createElement(card_1.CardContent, null,
            react_1["default"].createElement("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6" },
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "title" }, "Session Title *"),
                        react_1["default"].createElement(input_1.Input, __assign({ id: "title" }, register('title'), { placeholder: "Enter session title", className: errors.title ? 'border-red-500' : '' })),
                        errors.title && (react_1["default"].createElement("p", { className: "text-sm text-red-500 mt-1" }, errors.title.message))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                        react_1["default"].createElement(textarea_1.Textarea, __assign({ id: "description" }, register('description'), { placeholder: "Describe what this session is about", rows: 3, className: errors.description ? 'border-red-500' : '' })),
                        errors.description && (react_1["default"].createElement("p", { className: "text-sm text-red-500 mt-1" }, errors.description.message)))),
                react_1["default"].createElement(separator_1.Separator, null),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(label_1.Label, null, "Session Type *"),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-2" }, sessionTypeOptions.map(function (option) {
                        var Icon = option.icon;
                        return (react_1["default"].createElement("div", { key: option.value, className: "p-3 border rounded-lg cursor-pointer transition-colors " + (watchedValues.sessionType === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'), onClick: function () { return setValue('sessionType', option.value); } },
                            react_1["default"].createElement("div", { className: "flex items-start space-x-3" },
                                react_1["default"].createElement(Icon, { className: "h-5 w-5 mt-0.5 text-blue-600" }),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("h4", { className: "font-medium" }, option.label),
                                    react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, option.description)))));
                    }))),
                react_1["default"].createElement(separator_1.Separator, null),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "scheduledDate" }, "Date *"),
                        react_1["default"].createElement(input_1.Input, __assign({ id: "scheduledDate", type: "date" }, register('scheduledDate'), { min: new Date().toISOString().split('T')[0], className: errors.scheduledDate ? 'border-red-500' : '' })),
                        errors.scheduledDate && (react_1["default"].createElement("p", { className: "text-sm text-red-500 mt-1" }, errors.scheduledDate.message))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "scheduledTime" }, "Time *"),
                        react_1["default"].createElement(input_1.Input, __assign({ id: "scheduledTime", type: "time" }, register('scheduledTime'), { className: errors.scheduledTime ? 'border-red-500' : '' })),
                        errors.scheduledTime && (react_1["default"].createElement("p", { className: "text-sm text-red-500 mt-1" }, errors.scheduledTime.message)))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "duration" }, "Duration (minutes) *"),
                        react_1["default"].createElement(input_1.Input, __assign({ id: "duration", type: "number" }, register('duration', { valueAsNumber: true }), { min: 15, max: 480, step: 15, className: errors.duration ? 'border-red-500' : '' })),
                        errors.duration && (react_1["default"].createElement("p", { className: "text-sm text-red-500 mt-1" }, errors.duration.message))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "maxAttendees" }, "Max Attendees *"),
                        react_1["default"].createElement(input_1.Input, __assign({ id: "maxAttendees", type: "number" }, register('maxAttendees', { valueAsNumber: true }), { min: 2, max: 100, className: errors.maxAttendees ? 'border-red-500' : '' })),
                        errors.maxAttendees && (react_1["default"].createElement("p", { className: "text-sm text-red-500 mt-1" }, errors.maxAttendees.message)))),
                react_1["default"].createElement(separator_1.Separator, null),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(label_1.Label, null, "Tags"),
                    react_1["default"].createElement("div", { className: "flex items-center space-x-2 mt-2" },
                        react_1["default"].createElement(input_1.Input, { value: currentTag, onChange: function (e) { return setCurrentTag(e.target.value); }, placeholder: "Add a tag", onKeyPress: function (e) { return e.key === 'Enter' && (e.preventDefault(), addTag()); } }),
                        react_1["default"].createElement(button_1.Button, { type: "button", onClick: addTag, size: "sm" }, "Add")),
                    watchedValues.tags.length > 0 && (react_1["default"].createElement("div", { className: "flex flex-wrap gap-2 mt-2" }, watchedValues.tags.map(function (tag) { return (react_1["default"].createElement(badge_1.Badge, { key: tag, variant: "secondary", className: "flex items-center space-x-1" },
                        react_1["default"].createElement("span", null, tag),
                        react_1["default"].createElement(lucide_react_1.X, { className: "h-3 w-3 cursor-pointer", onClick: function () { return removeTag(tag); } }))); })))),
                react_1["default"].createElement(separator_1.Separator, null),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("h3", { className: "font-medium flex items-center space-x-2" },
                        react_1["default"].createElement(lucide_react_1.Settings, { className: "h-4 w-4" }),
                        react_1["default"].createElement("span", null, "Session Settings")),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                                react_1["default"].createElement(lucide_react_1.Save, { className: "h-4 w-4" }),
                                react_1["default"].createElement(label_1.Label, { htmlFor: "isRecordingEnabled" }, "Enable Recording")),
                            react_1["default"].createElement(switch_1.Switch, { id: "isRecordingEnabled", checked: watchedValues.isRecordingEnabled, onCheckedChange: function (checked) { return setValue('isRecordingEnabled', checked); } })),
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                                react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "h-4 w-4" }),
                                react_1["default"].createElement(label_1.Label, { htmlFor: "enableChat" }, "Enable Chat")),
                            react_1["default"].createElement(switch_1.Switch, { id: "enableChat", checked: watchedValues.enableChat, onCheckedChange: function (checked) { return setValue('enableChat', checked); } })),
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                                react_1["default"].createElement(lucide_react_1.Monitor, { className: "h-4 w-4" }),
                                react_1["default"].createElement(label_1.Label, { htmlFor: "enableScreenSharing" }, "Screen Sharing")),
                            react_1["default"].createElement(switch_1.Switch, { id: "enableScreenSharing", checked: watchedValues.enableScreenSharing, onCheckedChange: function (checked) { return setValue('enableScreenSharing', checked); } })),
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                                react_1["default"].createElement(lucide_react_1.Settings, { className: "h-4 w-4" }),
                                react_1["default"].createElement(label_1.Label, { htmlFor: "requireModerator" }, "Require Moderator")),
                            react_1["default"].createElement(switch_1.Switch, { id: "requireModerator", checked: watchedValues.requireModerator, onCheckedChange: function (checked) { return setValue('requireModerator', checked); } }))),
                    react_1["default"].createElement(separator_1.Separator, null),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                                react_1["default"].createElement(lucide_react_1.Mic, { className: "h-4 w-4" }),
                                react_1["default"].createElement(label_1.Label, { htmlFor: "startWithAudioMuted" }, "Start Audio Muted")),
                            react_1["default"].createElement(switch_1.Switch, { id: "startWithAudioMuted", checked: watchedValues.startWithAudioMuted, onCheckedChange: function (checked) { return setValue('startWithAudioMuted', checked); } })),
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                                react_1["default"].createElement(lucide_react_1.Video, { className: "h-4 w-4" }),
                                react_1["default"].createElement(label_1.Label, { htmlFor: "startWithVideoMuted" }, "Start Video Muted")),
                            react_1["default"].createElement(switch_1.Switch, { id: "startWithVideoMuted", checked: watchedValues.startWithVideoMuted, onCheckedChange: function (checked) { return setValue('startWithVideoMuted', checked); } })))),
                react_1["default"].createElement(separator_1.Separator, null),
                react_1["default"].createElement("div", { className: "flex items-center justify-end space-x-3" },
                    onCancel && (react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: onCancel }, "Cancel")),
                    react_1["default"].createElement(button_1.Button, { type: "submit", disabled: isSubmitting }, isSubmitting ? 'Creating...' : 'Create Session'))))));
};
exports["default"] = CreateSessionForm;
