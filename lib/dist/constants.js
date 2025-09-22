"use strict";
exports.__esModule = true;
exports.LOCAL_CANDID_UI = exports.HOST = exports.CANISTER_IDS = void 0;
// lib/constants.ts
exports.CANISTER_IDS = {
    LEARNING_ANALYTICS: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
    NOTIFICATIONS: "bd3sg-teaaa-aaaaa-qaaba-cai",
    RECOMMENDATIONS: "be2us-64aaa-aaaaa-qaabq-cai",
    SESSIONS: "br5f7-7uaaa-aaaaa-qaaca-cai",
    SOCIAL: "bw4dl-smaaa-aaaaa-qaacq-cai",
    USER_PROFILE: "b77ix-eeaaa-aaaaa-qaada-cai",
    CANDID_UI: "by6od-j4aaa-aaaaa-qaadq-cai"
};
exports.HOST = "https://ic0.app";
exports.LOCAL_CANDID_UI = "https://ic0.app/?canisterId=" + exports.CANISTER_IDS.CANDID_UI;
