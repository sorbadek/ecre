"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var image_1 = require("next/image");
var link_1 = require("next/link");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var auth_context_1 = require("@/lib/auth-context");
var features = [
    {
        id: "01",
        title: "Create Your Profile & Connect",
        description: "Sign up and build your unique PeerVerse profile, showcasing your interests and what you're looking to learn. Connect with like-minded peers and start your learning journey together.",
        icon: lucide_react_1.Users,
        color: "from-blue-500 to-cyan-500",
        mockupContent: "Profile Setup"
    },
    {
        id: "02",
        title: "Discover & Learn Together",
        description: "Explore courses, join interactive sessions, and attend live workshops. PeerVerse's smart matching helps you discover new friends, collaborators, or even your perfect mentor.",
        icon: lucide_react_1.BookOpen,
        color: "from-purple-500 to-pink-500",
        mockupContent: "Course Discovery"
    },
    {
        id: "03",
        title: "Earn XP & Level Up",
        description: "Once your account is active, you'll receive a unique referral code. Share this code with your network and watch them join the PeerVerse community. Every successful referral earns you rewards!",
        icon: lucide_react_1.Zap,
        color: "from-yellow-500 to-orange-500",
        mockupContent: "XP Dashboard"
    },
    {
        id: "04",
        title: "Learn & Grow",
        description: "For every new user who signs up using your referral code and activates their account, you earn a percentage (5%-10%) from their activation fee. The more you refer, the more you earn!",
        icon: lucide_react_1.Target,
        color: "from-green-500 to-emerald-500",
        mockupContent: "Learning Progress"
    },
];
function FeaturesPage() {
    var _a = auth_context_1.useAuth(), login = _a.login, loading = _a.loading, user = _a.user;
    var _b = react_1.useState([]), watermarkData = _b[0], setWatermarkData = _b[1];
    var _c = react_1.useState(false), showVideo = _c[0], setShowVideo = _c[1];
    react_1.useEffect(function () {
        var generateDiagonalWatermarkStyles = function () {
            var watermarks = [];
            var spacing = 200;
            var rows = Math.ceil(window.innerHeight / spacing) + 3;
            var cols = Math.ceil(window.innerWidth / spacing) + 3;
            for (var row = 0; row < rows; row++) {
                for (var col = 0; col < cols; col++) {
                    var offsetX = (row % 2) * (spacing / 2);
                    var x = col * spacing + offsetX - spacing;
                    var y = row * spacing - spacing;
                    watermarks.push({
                        top: y + "px",
                        left: x + "px"
                    });
                }
            }
            return watermarks;
        };
        setWatermarkData(generateDiagonalWatermarkStyles());
        var handleResize = function () {
            setWatermarkData(generateDiagonalWatermarkStyles());
        };
        window.addEventListener("resize", handleResize);
        return function () { return window.removeEventListener("resize", handleResize); };
    }, []);
    return (React.createElement("div", { className: "min-h-screen bg-gray-50 relative overflow-hidden" },
        React.createElement("div", { className: "fixed inset-0 pointer-events-none z-0" }, watermarkData.map(function (style, index) { return (React.createElement("div", { key: index, className: "absolute text-4xl font-bold text-gray-400 opacity-25 transform -rotate-12 select-none bradley-hand", style: {
                top: style.top,
                left: style.left
            } }, "Peerverse")); })),
        React.createElement("header", { className: "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl" },
            React.createElement("div", { className: "bg-white/90 backdrop-blur-md rounded-full shadow-lg px-6 py-3 flex items-center justify-between" },
                React.createElement(link_1["default"], { href: "/", className: "flex items-center gap-2" },
                    React.createElement(image_1["default"], { src: "/peerverse-logo.png", alt: "Peerverse", width: 24, height: 24, className: "rounded" }),
                    React.createElement("span", { className: "text-lg font-semibold text-gray-900 bradley-hand" }, "Peerverse")),
                React.createElement("nav", { className: "hidden md:flex items-center gap-8" },
                    React.createElement(link_1["default"], { href: "/", className: "text-gray-600 hover:text-gray-900 transition-colors font-medium bradley-hand" }, "Home"),
                    React.createElement(link_1["default"], { href: "/features", className: "text-blue-600 font-medium bradley-hand" }, "Features")),
                user ? (React.createElement(button_1.Button, { asChild: true, className: "bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium bradley-hand" },
                    React.createElement(link_1["default"], { href: "/dashboard" }, "Dashboard"))) : (React.createElement(button_1.Button, { onClick: login, disabled: loading, className: "bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium bradley-hand" }, loading ? "Connecting..." : "Get started")))),
        React.createElement("section", { className: "relative z-10 pt-32 pb-20 px-4 text-center" },
            React.createElement("div", { className: "max-w-4xl mx-auto" },
                React.createElement("h1", { className: "text-5xl md:text-6xl font-bold mb-6 bradley-hand-bold" },
                    React.createElement("span", { className: "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" }, "Your PeerVerse Journey")),
                React.createElement("p", { className: "text-xl text-gray-600 mb-8 bradley-hand max-w-3xl mx-auto" }, "Discover how PeerVerse helps you connect, grow your network, and unlock learning opportunities."),
                React.createElement(button_1.Button, { variant: "outline", size: "lg", className: "px-8 py-4 rounded-full text-lg bradley-hand-bold border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300 bg-transparent", onClick: function () { return setShowVideo(!showVideo); } },
                    React.createElement(lucide_react_1.Play, { className: "mr-2 h-5 w-5" }),
                    " Watch your journey through PeerVerse"),
                showVideo && (React.createElement("div", { className: "mt-8 relative" },
                    React.createElement("div", { className: "relative bg-black rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto" },
                        React.createElement("button", { onClick: function () { return setShowVideo(false); }, className: "absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors" },
                            React.createElement(lucide_react_1.X, { className: "h-5 w-5" })),
                        React.createElement("iframe", { width: "100%", height: "450", src: "https://www.youtube.com/embed/Ewq-FKNKqwQ", title: "PeerVerse Journey", frameBorder: "0", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", allowFullScreen: true, className: "w-full" })))))),
        React.createElement("section", { className: "relative z-10 py-20 px-4" },
            React.createElement("div", { className: "max-w-7xl mx-auto" }, features.map(function (feature, index) {
                var Icon = feature.icon;
                var isEven = index % 2 === 0;
                return (React.createElement("div", { key: feature.id, className: "mb-32" },
                    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-16 items-center " + (isEven ? "" : "lg:grid-flow-col-dense") },
                        React.createElement("div", { className: "" + (isEven ? "" : "lg:col-start-2") },
                            React.createElement("div", { className: "mb-6" },
                                React.createElement("span", { className: "text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent bradley-hand-bold" }, feature.id)),
                            React.createElement("h2", { className: "text-3xl md:text-4xl font-bold text-gray-900 mb-6 bradley-hand-bold" }, feature.title),
                            React.createElement("p", { className: "text-lg text-gray-700 mb-8 bradley-hand leading-relaxed" }, feature.description)),
                        React.createElement("div", { className: "" + (isEven ? "" : "lg:col-start-1") },
                            React.createElement(card_1.Card, { className: "w-full h-80 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden" },
                                React.createElement(card_1.CardContent, { className: "p-8 h-full flex flex-col items-center justify-center" },
                                    React.createElement("div", { className: "w-20 h-20 rounded-2xl bg-gradient-to-br " + feature.color + " flex items-center justify-center mb-6" },
                                        React.createElement(Icon, { className: "h-10 w-10 text-white" })),
                                    React.createElement("h3", { className: "text-xl font-bold text-gray-900 mb-4 bradley-hand-bold text-center" }, feature.mockupContent),
                                    React.createElement("div", { className: "w-full space-y-3" },
                                        React.createElement("div", { className: "h-3 bg-gray-200 rounded-full" }),
                                        React.createElement("div", { className: "h-3 bg-gray-200 rounded-full w-4/5" }),
                                        React.createElement("div", { className: "h-3 bg-gray-200 rounded-full w-3/5" })),
                                    React.createElement("div", { className: "mt-6 flex items-center gap-2" },
                                        React.createElement("div", { className: "w-8 h-8 bg-gray-200 rounded-full" }),
                                        React.createElement("div", { className: "w-8 h-8 bg-gray-200 rounded-full" }),
                                        React.createElement("div", { className: "w-8 h-8 bg-gray-200 rounded-full" })))))),
                    index < features.length - 1 && (React.createElement("div", { className: "text-center mt-16" }, user ? (React.createElement(button_1.Button, { asChild: true, size: "lg", className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg bradley-hand-bold" },
                        React.createElement(link_1["default"], { href: "/dashboard" },
                            "Continue Learning ",
                            React.createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })))) : (React.createElement(button_1.Button, { onClick: login, disabled: loading, size: "lg", className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg bradley-hand-bold" },
                        loading ? "Connecting..." : "Join PeerVerse Now",
                        " ",
                        React.createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })))))));
            }))),
        React.createElement("section", { className: "relative z-10 py-20 px-4" },
            React.createElement("div", { className: "max-w-4xl mx-auto text-center" },
                React.createElement("div", { className: "relative" },
                    React.createElement("div", { className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full blur-3xl opacity-30 -z-10" }),
                    React.createElement("h2", { className: "text-4xl md:text-5xl font-bold text-gray-900 mb-6 bradley-hand-bold" },
                        "Ready to start your",
                        React.createElement("span", { className: "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" },
                            " ",
                            "learning journey?")),
                    React.createElement("p", { className: "text-xl text-gray-700 mb-8 max-w-2xl mx-auto bradley-hand" }, "Join thousands of learners and educators who are already transforming their skills with PeerVerse."),
                    user ? (React.createElement(button_1.Button, { asChild: true, size: "lg", className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg bradley-hand-bold" },
                        React.createElement(link_1["default"], { href: "/dashboard" },
                            "Go to Dashboard ",
                            React.createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })))) : (React.createElement(button_1.Button, { onClick: login, disabled: loading, size: "lg", className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg bradley-hand-bold" },
                        loading ? "Connecting..." : "Join PeerVerse Today",
                        " ",
                        React.createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })))))),
        React.createElement("footer", { className: "relative z-10 text-center py-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm" },
            React.createElement("p", { className: "text-gray-500 text-sm bradley-hand" }, "\u00A9 2024 Peerverse. Built on the Internet Computer Protocol."))));
}
exports["default"] = FeaturesPage;
