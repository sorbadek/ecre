// lib/constants.ts
export const CANISTER_IDS = {
    LEARNING_ANALYTICS: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
    NOTIFICATIONS: "bd3sg-teaaa-aaaaa-qaaba-cai",
    RECOMMENDATIONS: "be2us-64aaa-aaaaa-qaabq-cai",
    SESSIONS: "br5f7-7uaaa-aaaaa-qaaca-cai",
    SOCIAL: "bw4dl-smaaa-aaaaa-qaacq-cai",
    USER_PROFILE: "b77ix-eeaaa-aaaaa-qaada-cai",
    CANDID_UI: "by6od-j4aaa-aaaaa-qaadq-cai"
  };
  
  export const HOST = "http://127.0.0.1:4943";
  export const LOCAL_CANDID_UI = `http://127.0.0.1:4943/?canisterId=${CANISTER_IDS.CANDID_UI}`;