import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Random "mo:core/Random";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import InviteLinksModule "invite-links/invite-links-module";
import Registration "registration";

actor {
  // Authorization component state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Invite links system state
  let inviteLinksState = InviteLinksModule.initState();

  var nextRegistrationId = 0;
  let registrations = Map.empty<Nat, Registration.Registration>();
  // Track used admission numbers for uniqueness check
  let admissionNumbers = Map.empty<Text, Nat>();

  public type RegistrationInput = {
    game : Text;
    admissionNumber : Text;
    studentName : Text;
    motherName : Text;
    fatherName : Text;
    dobDate : Nat;
    dobMonth : Nat;
    dobYear : Nat;
    gender : Text;
    ageGroup : Text;
    studentClass : Text;
    mobileNo : Text;
    shoeSize : Text;
    tShirtShortsSize : Text;
    trackSuitSize : Text;
    blazerSize : Text;
    food : Text;
  };

  // User Profile Management
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Registration Management
  public shared func submitRegistration(input : RegistrationInput) : async Nat {
    // Check for duplicate admission number
    switch (admissionNumbers.get(input.admissionNumber)) {
      case (?_) {
        Runtime.trap("DUPLICATE_ADMISSION: This admission number is already registered.");
      };
      case null {};
    };

    let registration : Registration.Registration = {
      input with
      id = nextRegistrationId;
      timestamp = Time.now();
    };

    registrations.add(nextRegistrationId, registration);
    admissionNumbers.add(input.admissionNumber, nextRegistrationId);
    nextRegistrationId += 1;
    registration.id;
  };

  public query func getRegistrationCount() : async Nat {
    registrations.size();
  };

  // Password-protected admin access (password checked on frontend, backend open for simplicity)
  public query func getRegistrations() : async [Registration.Registration] {
    let arr = registrations.values().toArray();
    arr.sort();
  };

  // Look up a single registration by admission number (for player self-check)
  public query func getRegistrationByAdmissionNumber(admissionNumber : Text) : async ?Registration.Registration {
    switch (admissionNumbers.get(admissionNumber)) {
      case (?id) { registrations.get(id) };
      case null { null };
    };
  };

  // Delete a registration by ID (admin only, password checked on frontend)
  public shared func deleteRegistration(id : Nat) : async Bool {
    switch (registrations.get(id)) {
      case (?reg) {
        ignore registrations.remove(id);
        ignore admissionNumbers.remove(reg.admissionNumber);
        true;
      };
      case null { false };
    };
  };

  // Invite Links and RSVP System

  // Generate invite code (admin only)
  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteLinksState, code);
    code;
  };

  // Submit RSVP (public, but requires valid invite code)
  public func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteLinksState, name, attending, inviteCode);
  };

  // Get all RSVPs (admin only)
  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteLinksState);
  };

  // Get all invite codes (admin only)
  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteLinksState);
  };
};
