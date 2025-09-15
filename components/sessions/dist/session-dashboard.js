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
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var use_api_clients_1 = require("@/lib/use-api-clients");
var create_session_form_1 = require("./create-session-form");
var jitsi_meet_1 = require("./jitsi-meet");
var session_recordings_1 = require("./session-recordings");
var SessionDashboard = function (_a) {
    var className = _a.className;
    var _b = react_1.useState([]), sessions = _b[0], setSessions = _b[1];
    var _c = react_1.useState([]), filteredSessions = _c[0], setFilteredSessions = _c[1];
    var _d = react_1.useState(true), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useState(''), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = react_1.useState('all'), statusFilter = _f[0], setStatusFilter = _f[1];
    var _g = react_1.useState('all'), typeFilter = _g[0], setTypeFilter = _g[1];
    var _h = react_1.useState('all-sessions'), activeTab = _h[0], setActiveTab = _h[1];
    var _j = react_1.useState(null), selectedSession = _j[0], setSelectedSession = _j[1];
    var _k = react_1.useState(false), showCreateForm = _k[0], setShowCreateForm = _k[1];
    var _l = react_1.useState(false), showJitsiMeet = _l[0], setShowJitsiMeet = _l[1];
    var _m = use_api_clients_1.useApiClients(), sessionClient = _m.sessionClient, isAuthenticated = _m.isAuthenticated, authLoading = _m.loading, user = _m.user;
    react_1.useEffect(function () {
        if (!authLoading && isAuthenticated && sessionClient) {
            loadSessions();
        }
    }, [isAuthenticated, authLoading, sessionClient]);
    react_1.useEffect(function () {
        filterSessions();
    }, [sessions, activeTab, statusFilter, searchTerm]);
    var loadSessions = function () { return __awaiter(void 0, void 0, void 0, function () {
        var allSessions, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAuthenticated || !sessionClient)
                        return [2 /*return*/];
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, sessionClient.getMySessions()];
                case 2:
                    allSessions = _a.sent();
                    setSessions(allSessions);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading sessions:', error_1);
                    sonner_1.toast.error('Failed to load sessions');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var filterSessions = function () {
        var filtered = sessions;
        // Filter by tab
        if (activeTab === 'live-sessions') {
            filtered = filtered.filter(function (session) {
                var status = getSessionStatusKey(session.status);
                return status === 'live';
            });
        }
        else if (activeTab === 'scheduled-sessions') {
            filtered = filtered.filter(function (session) {
                var status = getSessionStatusKey(session.status);
                return status === 'scheduled';
            });
        }
        else if (activeTab === 'my-sessions') {
            // Already filtered by user in getMySessions
        }
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(function (session) {
                return session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    session.tags.some(function (tag) { return tag.toLowerCase().includes(searchTerm.toLowerCase()); });
            });
        }
        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(function (session) {
                var status = getSessionStatusKey(session.status);
                return status === statusFilter;
            });
        }
        // Filter by type
        if (typeFilter !== 'all') {
            filtered = filtered.filter(function (session) {
                var type = getSessionTypeKey(session.sessionType);
                return type === typeFilter;
            });
        }
        setFilteredSessions(filtered);
    };
    var getSessionStatusKey = function (status) {
        if ('scheduled' in status)
            return 'scheduled';
        if ('live' in status)
            return 'live';
        if ('completed' in status)
            return 'completed';
        if ('cancelled' in status)
            return 'cancelled';
        if ('recording' in status)
            return 'recording';
        return 'unknown';
    };
    var getSessionTypeKey = function (type) {
        if ('video' in type)
            return 'video';
        if ('voice' in type)
            return 'voice';
        if ('screen_share' in type)
            return 'screen_share';
        if ('webinar' in type)
            return 'webinar';
        return 'unknown';
    };
    var getStatusBadgeVariant = function (status) {
        var statusKey = getSessionStatusKey(status);
        switch (statusKey) {
            case 'live': return 'destructive';
            case 'recording': return 'destructive';
            case 'scheduled': return 'default';
            case 'completed': return 'secondary';
            case 'cancelled': return 'outline';
            default: return 'outline';
        }
    };
    var getStatusLabel = function (status) {
        if (!sessionClient)
            return 'Unknown';
        return sessionClient.getSessionStatusLabel(status);
    };
    var getTypeIcon = function (type) {
        var typeKey = getSessionTypeKey(type);
        switch (typeKey) {
            case 'video': return react_1["default"].createElement(lucide_react_1.Video, { className: "h-4 w-4" });
            case 'voice': return react_1["default"].createElement(lucide_react_1.Mic, { className: "h-4 w-4" });
            case 'screen_share': return react_1["default"].createElement(lucide_react_1.Monitor, { className: "h-4 w-4" });
            case 'webinar': return react_1["default"].createElement(lucide_react_1.Globe, { className: "h-4 w-4" });
            default: return react_1["default"].createElement(lucide_react_1.Video, { className: "h-4 w-4" });
        }
    };
    var getTypeLabel = function (type) {
        if (!sessionClient)
            return 'Unknown';
        return sessionClient.getSessionTypeLabel(type);
    };
    var handleJoinSession = function (session) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!sessionClient)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, sessionClient.joinSession(session.id)];
                case 2:
                    _a.sent();
                    setSelectedSession(session);
                    setShowJitsiMeet(true);
                    sonner_1.toast.success('Joined session successfully');
                    loadSessions(); // Refresh to update participant count
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error joining session:', error_2);
                    sonner_1.toast.error('Failed to join session');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleLeaveSession = function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!sessionClient)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, sessionClient.leaveSession(sessionId)];
                case 2:
                    _a.sent();
                    setShowJitsiMeet(false);
                    setSelectedSession(null);
                    sonner_1.toast.success('Left session successfully');
                    loadSessions(); // Refresh to update participant count
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error leaving session:', error_3);
                    sonner_1.toast.error('Failed to leave session');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteSession = function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!sessionClient)
                        return [2 /*return*/];
                    if (!confirm('Are you sure you want to delete this session?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, sessionClient.deleteSession(sessionId)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Session deleted successfully');
                    loadSessions();
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error deleting session:', error_4);
                    sonner_1.toast.error('Failed to delete session');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleCopyMeetingUrl = function (meetingUrl) { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, navigator.clipboard.writeText(meetingUrl)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('Meeting URL copied to clipboard');
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error copying URL:', error_5);
                    sonner_1.toast.error('Failed to copy URL');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdateSession = function (sessionId, updates) { return __awaiter(void 0, void 0, void 0, function () {
        var updateInput, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!sessionClient)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    updateInput = {};
                    if (updates.title !== undefined)
                        updateInput.title = updates.title;
                    if (updates.description !== undefined)
                        updateInput.description = updates.description;
                    if (updates.scheduledTime !== undefined)
                        updateInput.scheduledTime = updates.scheduledTime;
                    if (updates.duration !== undefined)
                        updateInput.duration = updates.duration;
                    if (updates.maxAttendees !== undefined)
                        updateInput.maxAttendees = updates.maxAttendees;
                    if (updates.tags !== undefined)
                        updateInput.tags = updates.tags;
                    if (updates.recordSession !== undefined)
                        updateInput.recordSession = updates.recordSession;
                    return [4 /*yield*/, sessionClient.updateSession(sessionId, updateInput)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Session updated successfully');
                    loadSessions();
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    console.error('Error updating session:', error_6);
                    sonner_1.toast.error('Failed to update session');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleCopySessionUrl = function (session) {
        var url = window.location.origin + "/sessions/" + session.id;
        navigator.clipboard.writeText(url);
        sonner_1.toast.success('Session URL copied to clipboard');
    };
    var handleStartRecording = function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!sessionClient)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, sessionClient.startRecording(sessionId)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Recording started');
                    loadSessions();
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _a.sent();
                    console.error('Error starting recording:', error_7);
                    sonner_1.toast.error('Failed to start recording');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleStopRecording = function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!sessionClient)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, sessionClient.stopRecording(sessionId)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Recording stopped');
                    loadSessions();
                    return [3 /*break*/, 4];
                case 3:
                    error_8 = _a.sent();
                    console.error('Error stopping recording:', error_8);
                    sonner_1.toast.error('Failed to stop recording');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var formatDate = function (timestamp) {
        var date = new Date(Number(timestamp) / 1000000);
        return date.toLocaleString();
    };
    var formatDuration = function (startTime, endTime) {
        if (!endTime)
            return 'Ongoing';
        var duration = Number(endTime - startTime) / 1000000000; // Convert to seconds
        var hours = Math.floor(duration / 3600);
        var minutes = Math.floor((duration % 3600) / 60);
        if (hours > 0) {
            return hours + "h " + minutes + "m";
        }
        return minutes + "m";
    };
    var canJoinSession = function (session) {
        var status = getSessionStatusKey(session.status);
        return status === 'live' || status === 'scheduled';
    };
    var isSessionOwner = function (session) {
        // This would need to be implemented based on your authentication system
        // For now, assuming all sessions can be managed by the current user
        return true;
    };
    // Show loading state while auth is loading or sessionClient is not ready
    if (authLoading || !sessionClient) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center min-h-[400px]" },
            react_1["default"].createElement("div", { className: "text-center" },
                react_1["default"].createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4" }),
                react_1["default"].createElement("p", { className: "text-sky-600/70" }, "Initializing session client..."))));
    }
    if (!isAuthenticated) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center min-h-[400px]" },
            react_1["default"].createElement("div", { className: "text-center" },
                react_1["default"].createElement("p", { className: "text-sky-600/70 mb-4" }, "Please sign in to access sessions"))));
    }
    if (loading) {
        return (react_1["default"].createElement(card_1.Card, { className: className },
            react_1["default"].createElement(card_1.CardContent, { className: "p-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-center h-64" },
                    react_1["default"].createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" })))));
    }
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: className },
            react_1["default"].createElement("div", { className: "flex items-center justify-between mb-6" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, "Sessions"),
                    react_1["default"].createElement("p", { className: "text-gray-600" }, "Manage your video sessions and recordings")),
                react_1["default"].createElement(dialog_1.Dialog, { open: showCreateForm, onOpenChange: setShowCreateForm },
                    react_1["default"].createElement(dialog_1.DialogTrigger, { asChild: true },
                        react_1["default"].createElement(button_1.Button, null,
                            react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                            "Create Session")),
                    react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto" },
                        react_1["default"].createElement(dialog_1.DialogHeader, null,
                            react_1["default"].createElement(dialog_1.DialogTitle, null, "Create New Session")),
                        react_1["default"].createElement(create_session_form_1["default"], { onSuccess: function () {
                                setShowCreateForm(false);
                                loadSessions();
                            }, onCancel: function () { return setShowCreateForm(false); } })))),
            react_1["default"].createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6" },
                react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4" },
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "all-sessions" }, "All Sessions"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "live-sessions" }, "Live Sessions"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "scheduled-sessions" }, "Scheduled"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "recordings" }, "Recordings")),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "all-sessions", className: "space-y-6" },
                    react_1["default"].createElement(SessionsContent, { sessions: filteredSessions, searchTerm: searchTerm, setSearchTerm: setSearchTerm, statusFilter: statusFilter, setStatusFilter: setStatusFilter, typeFilter: typeFilter, setTypeFilter: setTypeFilter, onJoinSession: handleJoinSession, onDeleteSession: handleDeleteSession, onCopyMeetingUrl: handleCopyMeetingUrl, getStatusBadgeVariant: getStatusBadgeVariant, getStatusLabel: getStatusLabel, getTypeIcon: getTypeIcon, getTypeLabel: getTypeLabel, formatDate: formatDate, formatDuration: formatDuration, canJoinSession: canJoinSession, isSessionOwner: isSessionOwner })),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "live-sessions", className: "space-y-6" },
                    react_1["default"].createElement(SessionsContent, { sessions: filteredSessions, searchTerm: searchTerm, setSearchTerm: setSearchTerm, statusFilter: statusFilter, setStatusFilter: setStatusFilter, typeFilter: typeFilter, setTypeFilter: setTypeFilter, onJoinSession: handleJoinSession, onDeleteSession: handleDeleteSession, onCopyMeetingUrl: handleCopyMeetingUrl, getStatusBadgeVariant: getStatusBadgeVariant, getStatusLabel: getStatusLabel, getTypeIcon: getTypeIcon, getTypeLabel: getTypeLabel, formatDate: formatDate, formatDuration: formatDuration, canJoinSession: canJoinSession, isSessionOwner: isSessionOwner })),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "scheduled-sessions", className: "space-y-6" },
                    react_1["default"].createElement(SessionsContent, { sessions: filteredSessions, searchTerm: searchTerm, setSearchTerm: setSearchTerm, statusFilter: statusFilter, setStatusFilter: setStatusFilter, typeFilter: typeFilter, setTypeFilter: setTypeFilter, onJoinSession: handleJoinSession, onDeleteSession: handleDeleteSession, onCopyMeetingUrl: handleCopyMeetingUrl, getStatusBadgeVariant: getStatusBadgeVariant, getStatusLabel: getStatusLabel, getTypeIcon: getTypeIcon, getTypeLabel: getTypeLabel, formatDate: formatDate, formatDuration: formatDuration, canJoinSession: canJoinSession, isSessionOwner: isSessionOwner })),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "recordings", className: "space-y-6" },
                    react_1["default"].createElement(session_recordings_1["default"], { showAllRecordings: true })))),
        showJitsiMeet && selectedSession && (react_1["default"].createElement("div", { className: "fixed inset-0 bg-black bg-opacity-90 z-50" },
            react_1["default"].createElement(jitsi_meet_1["default"], { session: selectedSession, onLeave: function () { return handleLeaveSession(selectedSession.id); } })))));
};
var SessionsContent = function (_a) {
    var sessions = _a.sessions, searchTerm = _a.searchTerm, setSearchTerm = _a.setSearchTerm, statusFilter = _a.statusFilter, setStatusFilter = _a.setStatusFilter, typeFilter = _a.typeFilter, setTypeFilter = _a.setTypeFilter, onJoinSession = _a.onJoinSession, onDeleteSession = _a.onDeleteSession, onCopyMeetingUrl = _a.onCopyMeetingUrl, getStatusBadgeVariant = _a.getStatusBadgeVariant, getStatusLabel = _a.getStatusLabel, getTypeIcon = _a.getTypeIcon, getTypeLabel = _a.getTypeLabel, formatDate = _a.formatDate, formatDuration = _a.formatDuration, canJoinSession = _a.canJoinSession, isSessionOwner = _a.isSessionOwner;
    return (react_1["default"].createElement(card_1.Card, null,
        react_1["default"].createElement(card_1.CardContent, { className: "p-6" },
            react_1["default"].createElement("div", { className: "flex items-center space-x-4 mb-6" },
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement("div", { className: "relative" },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }),
                        react_1["default"].createElement(input_1.Input, { placeholder: "Search sessions...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-10" }))),
                react_1["default"].createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    react_1["default"].createElement(select_1.SelectTrigger, { className: "w-40" },
                        react_1["default"].createElement(select_1.SelectValue, null)),
                    react_1["default"].createElement(select_1.SelectContent, null,
                        react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "live" }, "Live"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "scheduled" }, "Scheduled"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled"))),
                react_1["default"].createElement(select_1.Select, { value: typeFilter, onValueChange: setTypeFilter },
                    react_1["default"].createElement(select_1.SelectTrigger, { className: "w-40" },
                        react_1["default"].createElement(select_1.SelectValue, null)),
                    react_1["default"].createElement(select_1.SelectContent, null,
                        react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "All Types"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "video" }, "Video"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "voice" }, "Voice"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "screen_share" }, "Screen Share"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "webinar" }, "Webinar")))),
            sessions.length === 0 ? (react_1["default"].createElement("div", { className: "text-center py-8 text-gray-500" },
                react_1["default"].createElement(lucide_react_1.Video, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" }),
                react_1["default"].createElement("p", { className: "text-lg font-medium mb-2" }, "No sessions found"),
                react_1["default"].createElement("p", { className: "text-sm" }, "Create your first session to get started."))) : (react_1["default"].createElement("div", { className: "space-y-4" }, sessions.map(function (session) { return (react_1["default"].createElement(card_1.Card, { key: session.id, className: "hover:shadow-md transition-shadow" },
                react_1["default"].createElement(card_1.CardContent, { className: "p-4" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement("div", { className: "flex items-center space-x-4" },
                            react_1["default"].createElement("div", { className: "w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center" }, getTypeIcon(session.sessionType)),
                            react_1["default"].createElement("div", { className: "flex-1" },
                                react_1["default"].createElement("div", { className: "flex items-center space-x-2 mb-1" },
                                    react_1["default"].createElement("h4", { className: "font-medium" }, session.title),
                                    react_1["default"].createElement(badge_1.Badge, { variant: getStatusBadgeVariant(session.status) }, getStatusLabel(session.status)),
                                    react_1["default"].createElement(badge_1.Badge, { variant: "outline" }, getTypeLabel(session.sessionType))),
                                react_1["default"].createElement("p", { className: "text-sm text-gray-600 mb-2" }, session.description),
                                react_1["default"].createElement("div", { className: "flex items-center space-x-4 text-sm text-gray-600" },
                                    react_1["default"].createElement("span", { className: "flex items-center space-x-1" },
                                        react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-3 w-3" }),
                                        react_1["default"].createElement("span", null, formatDate(session.scheduledTime))),
                                    react_1["default"].createElement("span", { className: "flex items-center space-x-1" },
                                        react_1["default"].createElement(lucide_react_1.Users, { className: "h-3 w-3" }),
                                        react_1["default"].createElement("span", null,
                                            Number(session.participantCount),
                                            " participants")),
                                    react_1["default"].createElement("span", { className: "flex items-center space-x-1" },
                                        react_1["default"].createElement(lucide_react_1.Clock, { className: "h-3 w-3" }),
                                        react_1["default"].createElement("span", null, formatDuration(session.scheduledTime, session.actualEndTime || undefined)))),
                                session.tags.length > 0 && (react_1["default"].createElement("div", { className: "flex items-center space-x-2 mt-2" }, session.tags.map(function (tag) { return (react_1["default"].createElement(badge_1.Badge, { key: tag, variant: "secondary", className: "text-xs" }, tag)); }))))),
                        react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                            canJoinSession(session) && (react_1["default"].createElement(button_1.Button, { variant: "default", size: "sm", onClick: function () { return onJoinSession(session); } },
                                react_1["default"].createElement(lucide_react_1.Play, { className: "h-4 w-4 mr-1" }),
                                "Join")),
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return onCopyMeetingUrl(session.meetingUrl || ''); } },
                                react_1["default"].createElement(lucide_react_1.Copy, { className: "h-4 w-4 mr-1" }),
                                "Copy URL"),
                            isSessionOwner(session) && (react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return onDeleteSession(session.id); } },
                                react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-1" }),
                                "Delete"))))))); }))))));
};
exports["default"] = SessionDashboard;
