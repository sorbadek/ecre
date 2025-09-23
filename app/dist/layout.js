"use strict";
exports.__esModule = true;
exports.metadata = exports.viewport = void 0;
var google_1 = require("next/font/google");
var google_2 = require("next/font/google");
require("./globals.css");
var theme_provider_1 = require("@/components/theme-provider");
var toaster_1 = require("@/components/ui/toaster");
var auth_context_1 = require("@/lib/auth-context");
var providers_1 = require("@/components/providers");
var inter = google_1.Inter({ subsets: ['latin'] });
var kalam = google_2.Kalam({
    subsets: ['latin'],
    weight: ['300', '400', '700'],
    variable: '--font-kalam'
});
// Viewport configuration
exports.viewport = {
    themeColor: '#ffffff',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
};
exports.metadata = {
    title: 'PeerVerse - Learn Together, Grow Forever',
    description: 'Connect with peers, share knowledge, and unlock your potential in our vibrant learning community',
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/icon.png', type: 'image/png', sizes: '512x512' },
        ],
        apple: [
            { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
        ]
    },
    manifest: '/site.webmanifest',
    openGraph: {
        title: 'PeerVerse - Learn Together, Grow Forever',
        description: 'Connect with peers, share knowledge, and unlock your potential in our vibrant learning community',
        url: 'https://peer-verse.app',
        siteName: 'PeerVerse',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630
            },
        ],
        locale: 'en_US',
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PeerVerse - Learn Together, Grow Forever',
        description: 'Connect with peers, share knowledge, and unlock your potential in our vibrant learning community',
        images: ['/og-image.jpg']
    },
    viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
    metadataBase: new URL('https://peer-verse.app'),
    alternates: {
        canonical: '/'
    }
};
function RootLayout(_a) {
    var children = _a.children;
    return (React.createElement("html", { lang: "en", suppressHydrationWarning: true },
        React.createElement("body", { className: inter.className + " " + kalam.variable },
            React.createElement(theme_provider_1.ThemeProvider, { attribute: "class", defaultTheme: "light", enableSystem: true, disableTransitionOnChange: true },
                React.createElement(providers_1.Providers, null,
                    React.createElement(auth_context_1.AuthProvider, null,
                        children,
                        React.createElement(toaster_1.Toaster, null)))))));
}
exports["default"] = RootLayout;
