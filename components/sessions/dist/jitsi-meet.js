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
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var use_api_clients_1 = require("@/lib/use-api-clients");
var jibril_recorder_1 = require("@/lib/jibril-recorder");
var JitsiMeet = function (_a) {
    var session = _a.session, onLeave = _a.onLeave, onSessionEnd = _a.onSessionEnd, onRecordingStart = _a.onRecordingStart, onRecordingStop = _a.onRecordingStop, onParticipantJoined = _a.onParticipantJoined, onParticipantLeft = _a.onParticipantLeft;
    // Refs
    var jitsiContainerRef = react_1.useRef(null);
    var jitsiApiRef = react_1.useRef(null);
    // State
    var _b = react_1.useState(false), isJitsiLoaded = _b[0], setIsJitsiLoaded = _b[1];
    var _c = react_1.useState(false), isConnected = _c[0], setIsConnected = _c[1];
    var _d = react_1.useState([]), participants = _d[0], setParticipants = _d[1];
    var _e = react_1.useState(false), isRecording = _e[0], setIsRecording = _e[1];
    var _f = react_1.useState(0), recordingDuration = _f[0], setRecordingDuration = _f[1];
    var _g = react_1.useState(null), currentRecording = _g[0], setCurrentRecording = _g[1];
    var _h = react_1.useState(null), jwtToken = _h[0], setJwtToken = _h[1];
    // Hooks
    var _j = use_api_clients_1.useApiClients(), isAuthenticated = _j.isAuthenticated, sessionClient = _j.sessionClient, user = _j.user;
    var jibrilRecorder = jibril_recorder_1.getJibrilRecorder();
    // Extract Jitsi config from session with fallbacks
    var jitsiConfig = react_1.useMemo(function () {
        var _a, _b, _c;
        // 1. Try to get from direct jitsiConfig array
        if ((_a = session.jitsiConfig) === null || _a === void 0 ? void 0 : _a[0]) {
            return session.jitsiConfig[0];
        }
        // 2. Try to get from metadata
        if ((_b = session.metadata) === null || _b === void 0 ? void 0 : _b.jitsiConfig) {
            return session.metadata.jitsiConfig;
        }
        // 3. Try to extract from description
        var extractFromDescription = function (description) {
            var jitsiConfigMatch = description.match(/<!-- JITSI_CONFIG:(.+?)-->/s);
            if (jitsiConfigMatch === null || jitsiConfigMatch === void 0 ? void 0 : jitsiConfigMatch[1]) {
                try {
                    return JSON.parse(jitsiConfigMatch[1]);
                }
                catch (error) {
                    console.error('Failed to parse Jitsi config from description:', error);
                }
            }
            return null;
        };
        var extracted = session.description ? extractFromDescription(session.description) : null;
        if (extracted)
            return extracted;
        // 4. Return default config if nothing else works
        return {
            roomName: "peer-" + Date.now(),
            displayName: ((_c = user === null || user === void 0 ? void 0 : user.principal) === null || _c === void 0 ? void 0 : _c.toString()) || 'Anonymous',
            email: '',
            avatarUrl: '',
            moderator: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableRecording: false,
            enableScreenSharing: true,
            enableChat: true,
            maxParticipants: 20
        };
    }, [session, user === null || user === void 0 ? void 0 : user.principal]);
    // Audio/Video controls state
    var _k = react_1.useState(jitsiConfig.startWithAudioMuted || false), isAudioMuted = _k[0], setIsAudioMuted = _k[1];
    var _l = react_1.useState(jitsiConfig.startWithVideoMuted || false), isVideoMuted = _l[0], setIsVideoMuted = _l[1];
    var _m = react_1.useState(false), isScreenSharing = _m[0], setIsScreenSharing = _m[1];
    var _o = react_1.useState(false), isFullscreen = _o[0], setIsFullscreen = _o[1];
    var _p = react_1.useState(jitsiConfig.enableChat || false), isChatOpen = _p[0], setIsChatOpen = _p[1];
    // Get user info for Jitsi
    var getUserInfo = react_1.useCallback(function () {
        var _a;
        return ({
            displayName: ((_a = user === null || user === void 0 ? void 0 : user.principal) === null || _a === void 0 ? void 0 : _a.toString()) || 'Anonymous',
            email: '',
            avatar: '',
            moderator: isHost
        });
    }, [user, isHost]);
    // Load Jitsi Meet API
    react_1.useEffect(function () {
        var loadJitsiScript = function () {
            if (window.JitsiMeetExternalAPI) {
                setIsJitsiLoaded(true);
                return;
            }
            var script = document.createElement('script');
            script.src = 'https://meet.jit.si/external_api.js';
            script.async = true;
            script.onload = function () { return setIsJitsiLoaded(true); };
            script.onerror = function () {
                sonner_1.toast.error('Failed to load Jitsi Meet. Please check your internet connection.');
            };
            document.head.appendChild(script);
        };
        loadJitsiScript();
    }, []);
    // Initialize Jitsi when loaded and container is ready
    react_1.useEffect(function () {
        if (!isJitsiLoaded || !jitsiContainerRef.current)
            return;
        try {
            var userInfo = getUserInfo();
            // Initialize Jitsi Meet
            var api_1 = new window.JitsiMeetExternalAPI('meet.jit.si', {
                roomName: jitsiConfig.roomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: userInfo.displayName,
                    email: userInfo.email
                },
                configOverwrite: {
                    startWithAudioMuted: jitsiConfig.startWithAudioMuted,
                    startWithVideoMuted: jitsiConfig.startWithVideoMuted,
                    enableWelcomePage: false,
                    enableClosePage: false,
                    enableNoAudioDetection: true,
                    enableNoisyMicDetection: true,
                    enableAutomaticUrlCopy: true,
                    enableEncodedTransformSupport: true,
                    disableDeepLinking: true,
                    disableInviteFunctions: true,
                    disableRemoteMute: !jitsiConfig.moderator,
                    disableRemoteControl: !jitsiConfig.moderator,
                    enableEmailInStats: false,
                    enableLobbyChat: jitsiConfig.enableChat,
                    prejoinPageEnabled: false,
                    startAudioMuted: jitsiConfig.startWithAudioMuted ? 1 : 0,
                    startVideoMuted: jitsiConfig.startWithVideoMuted ? 1 : 0
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                    SHOW_POWERED_BY: false,
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    DISABLE_VIDEO_BACKGROUND: true,
                    DISABLE_PRESENCE_STATUS: true,
                    DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
                    DISABLE_TRANSCRIPTION_SUBTITLES: true,
                    DISABLE_POLLS: true,
                    DISABLE_REACTIONS: true,
                    DISABLE_MEETING_NAME: false,
                    MOBILE_APP_PROMO: false,
                    MAXIMUM_ZOOMING_COEFFICIENT: 1.0,
                    ENABLE_FEEDBACK_ANIMATION: false,
                    CLOSE_PAGE_GUEST_HINT: false,
                    RECENT_LIST_ENABLED: false,
                    DEFAULT_BACKGROUND: '#111827',
                    DEFAULT_LOGO_URL: '',
                    HIDE_INVITE_MORE_HEADER: true,
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security'
                    ]
                }
            });
            jitsiApiRef.current = api_1;
            // Event listeners
            api_1.addListener('videoConferenceJoined', handleConferenceJoined);
            api_1.addListener('videoConferenceLeft', handleConferenceLeft);
            api_1.addListener('participantJoined', handleParticipantJoined);
            api_1.addListener('participantLeft', handleParticipantLeft);
            api_1.addListener('audioMuteStatusChanged', handleAudioMuteStatusChanged);
            api_1.addListener('videoMuteStatusChanged', handleVideoMuteStatusChanged);
            api_1.addListener('screenSharingStatusChanged', handleScreenSharingStatusChanged);
            api_1.addListener('recordingStatusChanged', handleRecordingStatusChanged);
            // Cleanup function
            return function () {
                api_1.dispose();
                jitsiApiRef.current = null;
            };
        }
        catch (error) {
            console.error('Error initializing Jitsi Meet:', error);
            sonner_1.toast.error('Failed to initialize Jitsi Meet. Please try again.');
        }
    }, [isJitsiLoaded, jitsiConfig, getUserInfo]);
    // Recording timer
    react_1.useEffect(function () {
        var interval;
        if (isRecording && currentRecording) {
            interval = setInterval(function () {
                var now = Date.now() * 1000000; // Convert to nanoseconds
                var startTime = Number(currentRecording.startTime);
                var duration = Math.floor((now - startTime) / 1000000000); // Convert to seconds
                setRecordingDuration(duration);
            }, 1000);
        }
        return function () {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isRecording, currentRecording]);
    // Event handlers
    var handleConferenceJoined = react_1.useCallback(function (event) {
        console.log('Conference joined:', event);
        setIsConnected(true);
        sonner_1.toast.success('Successfully joined the session');
    }, []);
    var handleConferenceLeft = react_1.useCallback(function (event) {
        console.log('Conference left:', event);
        setIsConnected(false);
        onSessionEnd === null || onSessionEnd === void 0 ? void 0 : onSessionEnd();
    }, [onSessionEnd]);
    var handleParticipantJoined = react_1.useCallback(function (event) {
        console.log('Participant joined:', event);
        var participant = {
            id: event.id,
            displayName: event.displayName || 'Anonymous',
            email: event.email,
            avatarURL: event.avatarURL,
            role: event.role || 'participant'
        };
        setParticipants(function (prev) { return __spreadArrays(prev, [participant]); });
        onParticipantJoined === null || onParticipantJoined === void 0 ? void 0 : onParticipantJoined(participant);
        sonner_1.toast.info(participant.displayName + " joined the session");
    }, [onParticipantJoined]);
    var handleParticipantLeft = react_1.useCallback(function (event) {
        console.log('Participant left:', event);
        setParticipants(function (prev) { return prev.filter(function (p) { return p.id !== event.id; }); });
        onParticipantLeft === null || onParticipantLeft === void 0 ? void 0 : onParticipantLeft(event);
        sonner_1.toast.info((event.displayName || 'A participant') + " left the session");
    }, [onParticipantLeft]);
    var handleAudioMuteStatusChanged = react_1.useCallback(function (event) {
        setIsAudioMuted(event.muted);
    }, []);
    var handleVideoMuteStatusChanged = react_1.useCallback(function (event) {
        setIsVideoMuted(event.muted);
    }, []);
    var handleScreenSharingStatusChanged = react_1.useCallback(function (event) {
        setIsScreenSharing(event.on);
    }, []);
    var handleRecordingStatusChanged = react_1.useCallback(function (event) {
        console.log('Recording status changed:', event);
        if (event.status === 'on') {
            setIsRecording(true);
        }
        else if (event.status === 'off') {
            setIsRecording(false);
        }
    }, []);
    // Control handlers
    var toggleAudio = react_1.useCallback(function () {
        if (!jitsiApiRef.current)
            return;
        jitsiApiRef.current.executeCommand('toggleAudio');
    }, []);
    var toggleVideo = react_1.useCallback(function () {
        if (!jitsiApiRef.current)
            return;
        jitsiApiRef.current.executeCommand('toggleVideo');
    }, []);
    var toggleScreenShare = react_1.useCallback(function () {
        if (!jitsiApiRef.current)
            return;
        jitsiApiRef.current.executeCommand('toggleShareScreen');
    }, []);
    var toggleFullscreen = react_1.useCallback(function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()["catch"](function (err) {
                console.error('Error attempting to enable fullscreen:', err);
            });
        }
        else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);
    var toggleChat = react_1.useCallback(function () {
        if (!jitsiApiRef.current)
            return;
        jitsiApiRef.current.executeCommand('toggleChat');
        setIsChatOpen(!isChatOpen);
    }, [isChatOpen]);
    var leaveSession = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (jitsiApiRef.current) {
                        jitsiApiRef.current.dispose();
                        jitsiApiRef.current = null;
                    }
                    if (!onLeave) return [3 /*break*/, 2];
                    return [4 /*yield*/, onLeave()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error leaving session:', error_1);
                    sonner_1.toast.error('Failed to leave session properly');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [onLeave]);
    var startRecording = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var recordingConfig, jibrilRecordingId, recordingInfo, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!session.isRecordingEnabled) {
                        sonner_1.toast.error('Recording is not enabled for this session');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    recordingConfig = {
                        quality: '1080p',
                        format: 'mp4',
                        includeAudio: true,
                        includeVideo: true,
                        includeScreenShare: false,
                        bitrate: 2500000,
                        frameRate: 30
                    };
                    return [4 /*yield*/, jibrilRecorder.startRecording(__assign(__assign({}, recordingConfig), { roomName: jitsiConfig.roomName }))];
                case 2:
                    jibrilRecordingId = _a.sent();
                    recordingInfo = {
                        id: jibrilRecordingId,
                        sessionId: session.id,
                        status: 'recording',
                        startTime: BigInt(Date.now() * 1000000)
                    };
                    setCurrentRecording(recordingInfo);
                    setIsRecording(true);
                    setRecordingDuration(0);
                    onRecordingStart === null || onRecordingStart === void 0 ? void 0 : onRecordingStart(recordingInfo);
                    sonner_1.toast.success('Recording started successfully!');
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error starting recording:', error_2);
                    sonner_1.toast.error('Failed to start recording: ' + error_2.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [jitsiConfig.roomName, jibrilRecorder, onRecordingStart, session.id, session.isRecordingEnabled]);
    var stopRecording = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var updatedRecording, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentRecording)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // Stop Jibril recording
                    return [4 /*yield*/, jibrilRecorder.stopRecording(currentRecording.id)];
                case 2:
                    // Stop Jibril recording
                    _a.sent();
                    updatedRecording = __assign(__assign({}, currentRecording), { status: 'processing', endTime: BigInt(Date.now() * 1000000) });
                    setCurrentRecording(updatedRecording);
                    setIsRecording(false);
                    onRecordingStop === null || onRecordingStop === void 0 ? void 0 : onRecordingStop(updatedRecording);
                    sonner_1.toast.success('Recording stopped. Processing...');
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error stopping recording:', error_3);
                    sonner_1.toast.error('Failed to stop recording: ' + error_3.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [currentRecording, jibrilRecorder, onRecordingStop]);
    // Format recording duration to HH:MM:SS
    var formatRecordingDuration = function (seconds) {
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;
        if (hours > 0) {
            return hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + secs.toString().padStart(2, '0');
        }
        return minutes.toString().padStart(2, '0') + ":" + secs.toString().padStart(2, '0');
    };
    // Render loading state
    if (!isJitsiLoaded) {
        return (react_1["default"].createElement(card_1.Card, { className: "w-full h-96 flex items-center justify-center" },
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("div", { className: "flex flex-col items-center space-y-4" },
                    react_1["default"].createElement("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary" }),
                    react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Loading Jitsi Meet...")))));
    }
    // Render main component
    return (react_1["default"].createElement("div", { className: "flex flex-col w-full h-full bg-background rounded-lg overflow-hidden border" },
        react_1["default"].createElement("div", { className: "flex-1 relative" },
            react_1["default"].createElement("div", { ref: jitsiContainerRef, className: "w-full h-full bg-gray-900" }),
            react_1["default"].createElement("div", { className: "absolute top-4 left-4 right-4 flex justify-between items-center" },
                react_1["default"].createElement("div", { className: "bg-black/70 text-white px-3 py-1 rounded-full flex items-center space-x-2" },
                    react_1["default"].createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
                    react_1["default"].createElement("span", null,
                        participants.length + 1,
                        " participants")),
                isRecording && (react_1["default"].createElement("div", { className: "bg-red-600 text-white px-3 py-1 rounded-full flex items-center space-x-2" },
                    react_1["default"].createElement("div", { className: "w-2 h-2 bg-white rounded-full animate-pulse" }),
                    react_1["default"].createElement("span", null,
                        "REC ",
                        formatRecordingDuration(recordingDuration))))),
            react_1["default"].createElement("div", { className: "absolute bottom-4 left-0 right-0 flex justify-center" },
                react_1["default"].createElement("div", { className: "bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2" },
                    react_1["default"].createElement(button_1.Button, { variant: isAudioMuted ? "destructive" : "secondary", size: "icon", onClick: toggleAudio, className: "rounded-full" }, isAudioMuted ? react_1["default"].createElement(lucide_react_1.MicOff, { className: "h-5 w-5" }) : react_1["default"].createElement(lucide_react_1.Mic, { className: "h-5 w-5" })),
                    react_1["default"].createElement(button_1.Button, { variant: isVideoMuted ? "destructive" : "secondary", size: "icon", onClick: toggleVideo, className: "rounded-full" }, isVideoMuted ? react_1["default"].createElement(lucide_react_1.VideoOff, { className: "h-5 w-5" }) : react_1["default"].createElement(lucide_react_1.Video, { className: "h-5 w-5" })),
                    react_1["default"].createElement(button_1.Button, { variant: isScreenSharing ? "default" : "secondary", size: "icon", onClick: toggleScreenShare, className: "rounded-full", disabled: !jitsiConfig.enableScreenSharing }, isScreenSharing ? react_1["default"].createElement(lucide_react_1.MonitorOff, { className: "h-5 w-5" }) : react_1["default"].createElement(lucide_react_1.Monitor, { className: "h-5 w-5" })),
                    react_1["default"].createElement(button_1.Button, { variant: isChatOpen ? "default" : "secondary", size: "icon", onClick: toggleChat, className: "rounded-full", disabled: !jitsiConfig.enableChat },
                        react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5" })),
                    react_1["default"].createElement(separator_1.Separator, { orientation: "vertical", className: "h-6 mx-1" }),
                    jitsiConfig.enableRecording && (react_1["default"].createElement(button_1.Button, { variant: isRecording ? "destructive" : "secondary", size: "sm", onClick: isRecording ? stopRecording : startRecording, className: "rounded-full flex items-center space-x-1", disabled: !isConnected }, isRecording ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Square, { className: "h-4 w-4" }),
                        react_1["default"].createElement("span", null, "Stop Recording"))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Play, { className: "h-4 w-4" }),
                        react_1["default"].createElement("span", null, "Record"))))),
                    react_1["default"].createElement(button_1.Button, { variant: "secondary", size: "icon", onClick: toggleFullscreen, className: "rounded-full ml-1" }, isFullscreen ? (react_1["default"].createElement(lucide_react_1.Minimize, { className: "h-5 w-5" })) : (react_1["default"].createElement(lucide_react_1.Maximize, { className: "h-5 w-5" }))),
                    react_1["default"].createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: leaveSession, className: "rounded-full ml-1" },
                        react_1["default"].createElement(lucide_react_1.PhoneOff, { className: "h-4 w-4 mr-1" }),
                        react_1["default"].createElement("span", null, "Leave"))))),
        react_1["default"].createElement("div", { className: "bg-card border-t p-2 flex items-center justify-between text-sm" },
            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                react_1["default"].createElement(lucide_react_1.User, { className: "h-4 w-4 text-muted-foreground" }),
                react_1["default"].createElement("span", { className: "font-medium" }, jitsiConfig.displayName),
                react_1["default"].createElement("span", { className: "text-muted-foreground" }, "is in the session")),
            react_1["default"].createElement("div", { className: "flex items-center space-x-4" },
                react_1["default"].createElement("div", { className: "flex items-center space-x-1 text-muted-foreground" },
                    react_1["default"].createElement(lucide_react_1.Clock, { className: "h-4 w-4" }),
                    react_1["default"].createElement("span", null, new Date().toLocaleTimeString())),
                react_1["default"].createElement("div", { className: "flex items-center space-x-1 text-muted-foreground" },
                    react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-4 w-4" }),
                    react_1["default"].createElement("span", null, new Date().toLocaleDateString()))))));
};
exports["default"] = JitsiMeet;
