import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Int32 "mo:base/Int32";

actor SocialCanister {

  // =========================
  // Types
  // =========================
  public type OnlineStatus = { #online; #away; #offline };

  public type PartnerProfile = {
    principal: Principal;
    name: Text;
    role: Text;
    xp: Nat;
    initials: Text;
    avatarColor: Text;
    onlineStatus: OnlineStatus;
    lastActive: Int;        // ns since epoch
    studyStreak: Nat;
    completedCourses: Nat;
  };

  public type PartnerRequest = {
    id: Text;
    fromPrincipal: Principal;
    toPrincipal: Principal;
    fromName: Text;
    message: ?Text;
    timestamp: Int;         // ns since epoch
    status: { #pending; #accepted; #declined };
  };

  public type StudyGroup = {
    id: Text;
    name: Text;
    description: Text;
    createdBy: Principal;
    members: [Principal];
    maxMembers: Nat;
    isPublic: Bool;
    tags: [Text];
    createdAt: Int;         // ns since epoch
    lastActivity: Int;      // ns since epoch
  };

  public type SocialStats = {
    totalPartners: Nat;
    activePartners: Nat;
    studyGroups: Nat;
    totalInteractions: Nat;
    weeklyInteractions: Nat;
  };

  // =========================
  // State
  // =========================
  private stable var nextRequestId: Nat = 1;
  private stable var nextGroupId: Nat = 1;

  private var profiles       = HashMap.HashMap<Principal, PartnerProfile>(10, Principal.equal, Principal.hash);
  private var partnerships   = HashMap.HashMap<Principal, [Principal]>(10, Principal.equal, Principal.hash);
  private var partnerRequests= HashMap.HashMap<Text, PartnerRequest>(10, Text.equal, Text.hash);
  private var studyGroups    = HashMap.HashMap<Text, StudyGroup>(10, Text.equal, Text.hash);
  private var userGroups     = HashMap.HashMap<Principal, [Text]>(10, Principal.equal, Principal.hash);

  // =========================
  // Helpers
  // =========================
  private func appendOne<T>(arr: [T], x: T): [T] {
    let buf = Buffer.fromArray<T>(arr);
    buf.add(x);
    Buffer.toArray(buf)
  };

  private func generateRequestId(): Text {
    let id = "request_" # Nat.toText(nextRequestId);
    nextRequestId += 1;
    id
  };

  private func generateGroupId(): Text {
    let id = "group_" # Nat.toText(nextGroupId);
    nextGroupId += 1;
    id
  };

  private func getInitials(name: Text): Text {
    let words = Text.split(name, #char ' ');
    var initials = "";
    for (word in words) {
      if (Text.size(word) > 0) {
        let it = Text.toIter(word);
        switch (it.next()) {
          case null {};
          case (?c) {
            initials := initials # Text.fromChar(c);
            if (Text.size(initials) >= 2) {
              return Text.toUppercase(initials);
            };
          };
        };
      };
    };
    if (Text.size(initials) == 0) {
      "U"
    } else {
      Text.toUppercase(initials)
    }
  };

  private func nat32ToInt(n: Nat32): Int {
    Int32.toInt(Int32.fromNat32(n))
  };

  private func getRandomAvatarColor(): Text {
    let colors = [
      "bg-gradient-to-r from-pink-500 to-rose-400",
      "bg-gradient-to-r from-blue-500 to-cyan-400",
      "bg-gradient-to-r from-purple-500 to-violet-400",
      "bg-gradient-to-r from-green-500 to-emerald-400",
      "bg-gradient-to-r from-amber-500 to-orange-400",
      "bg-gradient-to-r from-red-500 to-pink-400",
      "bg-gradient-to-r from-indigo-500 to-purple-400"
    ];
    let hashNat32 : Nat32 = Text.hash(Principal.toText(Principal.fromActor(SocialCanister)));
    let idxNat : Nat = Nat32.toNat(hashNat32);
    let index = idxNat % colors.size();
    colors[index]
  };

  // =========================
  // Public API
  // =========================
  public shared(msg) func updateProfile(name: Text, role: Text): async Result.Result<PartnerProfile, Text> {
    let caller = msg.caller;
    let profile: PartnerProfile = {
      principal = caller;
      name = name;
      role = role;
      xp = 1000;
      initials = getInitials(name);
      avatarColor = getRandomAvatarColor();
      onlineStatus = #online;
      lastActive = Time.now();
      studyStreak = 0;
      completedCourses = 0;
    };
    profiles.put(caller, profile);
    #ok(profile)
  };

  public shared(msg) func getMyProfile(): async ?PartnerProfile {
    profiles.get(msg.caller)
  };

  public shared(msg) func getMyPartners(): async [PartnerProfile] {
    await getMyPartnersQuery()
  };

  public shared query(msg) func getMyPartnersQuery(): async [PartnerProfile] {
    let partnerPrincipals = switch (partnerships.get(msg.caller)) {
      case null { [] };
      case (?ps) { ps };
    };
    Array.mapFilter<Principal, PartnerProfile>(partnerPrincipals, func(p) { profiles.get(p) })
  };

  public shared(msg) func sendPartnerRequest(toPrincipal: Principal, message: ?Text): async Result.Result<PartnerRequest, Text> {
    let caller = msg.caller;
    if (caller == toPrincipal) return #err("Cannot send partner request to yourself");

    let requestId = generateRequestId();
    let fromName = switch (profiles.get(caller)) {
      case null { Principal.toText(caller) };
      case (?p) { p.name };
    };

    let request: PartnerRequest = {
      id = requestId;
      fromPrincipal = caller;
      toPrincipal = toPrincipal;
      fromName = fromName;
      message = message;
      timestamp = Time.now();
      status = #pending;
    };

    partnerRequests.put(requestId, request);
    #ok(request)
  };

  public shared(msg) func acceptPartnerRequest(requestId: Text): async Result.Result<PartnerRequest, Text> {
    let caller = msg.caller;
    switch (partnerRequests.get(requestId)) {
      case null { #err("Request not found") };
      case (?request) {
        if (request.toPrincipal != caller) return #err("Unauthorized");
        let updated = { request with status = #accepted };
        partnerRequests.put(requestId, updated);

        let fromPartners = switch (partnerships.get(request.fromPrincipal)) { case null { [] }; case (?ps) { ps } };
        let toPartners   = switch (partnerships.get(request.toPrincipal))   { case null { [] }; case (?ps) { ps } };

        partnerships.put(request.fromPrincipal, appendOne(fromPartners, request.toPrincipal));
        partnerships.put(request.toPrincipal, appendOne(toPartners, request.fromPrincipal));
        #ok(updated)
      };
    }
  };

  public shared(msg) func declinePartnerRequest(requestId: Text): async Result.Result<PartnerRequest, Text> {
    let caller = msg.caller;
    switch (partnerRequests.get(requestId)) {
      case null { #err("Request not found") };
      case (?request) {
        if (request.toPrincipal != caller) return #err("Unauthorized");
        let updated = { request with status = #declined };
        partnerRequests.put(requestId, updated);
        #ok(updated)
      };
    }
  };

  public shared(msg) func getPendingRequests(): async [PartnerRequest] {
    let caller = msg.caller;
    let allRequests = Iter.toArray(partnerRequests.vals());
    Array.filter<PartnerRequest>(allRequests, func(r) {
      r.toPrincipal == caller and r.status == #pending
    })
  };

  public shared(msg) func createStudyGroup(
    name: Text,
    description: Text,
    isPublic: Bool,
    tags: [Text],
    maxMembers: Nat
  ): async Result.Result<StudyGroup, Text> {
    let caller = msg.caller;
    let groupId = generateGroupId();

    let group: StudyGroup = {
      id = groupId;
      name = name;
      description = description;
      createdBy = caller;
      members = [caller];
      maxMembers = maxMembers;
      isPublic = isPublic;
      tags = tags;
      createdAt = Time.now();
      lastActivity = Time.now();
    };

    studyGroups.put(groupId, group);
    let gs = switch (userGroups.get(caller)) { case null { [] }; case (?x) { x } };
    userGroups.put(caller, appendOne(gs, groupId));
    #ok(group)
  };

  public shared(msg) func joinStudyGroup(groupId: Text): async Result.Result<StudyGroup, Text> {
    let caller = msg.caller;
    switch (studyGroups.get(groupId)) {
      case null { #err("Study group not found") };
      case (?group) {
        if (group.members.size() >= group.maxMembers) return #err("Study group is full");
        if (Array.find<Principal>(group.members, func(p) { p == caller }) != null) return #err("Already a member");

        let updated = { group with members = appendOne(group.members, caller); lastActivity = Time.now() };
        studyGroups.put(groupId, updated);

        let gs = switch (userGroups.get(caller)) { case null { [] }; case (?x) { x } };
        userGroups.put(caller, appendOne(gs, groupId));
        #ok(updated)
      };
    }
  };

  public shared(msg) func getMyStudyGroups(): async [StudyGroup] {
    let caller = msg.caller;
    let ids = switch (userGroups.get(caller)) { case null { [] }; case (?x) { x } };
    Array.mapFilter<Text, StudyGroup>(ids, func(id) { studyGroups.get(id) })
  };

  public shared(msg) func updateOnlineStatus(status: OnlineStatus): async Result.Result<PartnerProfile, Text> {
    let caller = msg.caller;
    switch (profiles.get(caller)) {
      case null { #err("Profile not found") };
      case (?p) {
        let updated = { p with onlineStatus = status; lastActive = Time.now() };
        profiles.put(caller, updated);
        #ok(updated)
      };
    }
  };

  public shared(_msg) func recordInteraction(_partnerPrincipal: Principal, _interactionType: Text): async Result.Result<Text, Text> {
    // Placeholder (extend later to track interactions)
    #ok("Interaction recorded")
  };

  public shared(msg) func removePartner(partnerPrincipal: Principal): async Result.Result<Text, Text> {
    let caller = msg.caller;

    let callerPartners = switch (partnerships.get(caller)) { case null { [] }; case (?ps) { ps } };
    partnerships.put(caller, Array.filter<Principal>(callerPartners, func(p) { p != partnerPrincipal }));

    let partnerPartners = switch (partnerships.get(partnerPrincipal)) { case null { [] }; case (?ps) { ps } };
    partnerships.put(partnerPrincipal, Array.filter<Principal>(partnerPartners, func(p) { p != caller }));

    #ok("Partner removed")
  };

  public shared(msg) func getSocialStats(): async SocialStats {
    let partners = switch (partnerships.get(msg.caller)) { case null { [] }; case (?ps) { ps } };
    let groups   = switch (userGroups.get(msg.caller))   { case null { [] }; case (?gs) { gs } };
    {
      totalPartners      = partners.size();
      activePartners     = partners.size(); // naive for now
      studyGroups        = groups.size();
      totalInteractions  = 0;
      weeklyInteractions = 0;
    }
  };

  public shared(msg) func generateSamplePartners(): async Result.Result<Text, Text> {
    let caller = msg.caller;

    let samplePartners = [
      ("Sarah Chen",        "Frontend Developer", 15420, #online),
      ("Michael Rodriguez", "Full Stack Engineer", 22100, #away),
      ("Emily Watson",      "Backend Developer",   18750, #online),
      ("David Kim",         "DevOps Engineer",     19800, #offline),
      ("Lisa Thompson",     "UI/UX Designer",      14200, #online),
    ];

    var partnerPrincipals: [Principal] = [];

    for ((name, role, xp, status) in samplePartners.vals()) {
      // NOTE: using the anonymous principal as a placeholder
      let mockPrincipal = Principal.fromText("2vxsx-fae");
      let hashInt : Int = nat32ToInt(Text.hash(Principal.toText(mockPrincipal)));

      let profile: PartnerProfile = {
        principal = mockPrincipal;
        name = name;
        role = role;
        xp = xp;
        initials = getInitials(name);
        avatarColor = getRandomAvatarColor();
        onlineStatus = status;
        // Subtract up to 2 hours (in ns) based on hash
        lastActive = Time.now() - ((hashInt % 7_200) * 1_000_000_000);
        // Derive streaks/courses deterministically from strings, ensure Nat via Int.abs + Nat.fromInt
        studyStreak = (Nat32.toNat(Text.hash(name)) % 20) + 1;
        completedCourses = (Nat32.toNat(Text.hash(role)) % 13) + 3;
      };

      profiles.put(mockPrincipal, profile);
      partnerPrincipals := appendOne(partnerPrincipals, mockPrincipal);
    };

    partnerships.put(caller, partnerPrincipals);
    #ok("Sample partners generated successfully")
  };

  // =========================
  // System hooks
  // =========================
  system func preupgrade() {};
  system func postupgrade() {};
}

