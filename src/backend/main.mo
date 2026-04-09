import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Registration "registration";



actor {
  var nextRegistrationId = 0;
  let registrations = Map.empty<Nat, Registration.Registration>();
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

  public shared func submitRegistration(input : RegistrationInput) : async Nat {
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

  public shared func updateRegistration(id : Nat, input : RegistrationInput) : async Bool {
    switch (registrations.get(id)) {
      case null { false };
      case (?existing) {
        if (existing.admissionNumber != input.admissionNumber) {
          switch (admissionNumbers.get(input.admissionNumber)) {
            case (?_) {
              Runtime.trap("DUPLICATE_ADMISSION: This admission number is already registered.");
            };
            case null {};
          };
          admissionNumbers.remove(existing.admissionNumber);
          admissionNumbers.add(input.admissionNumber, id);
        };
        let updated : Registration.Registration = {
          input with
          id = existing.id;
          timestamp = existing.timestamp;
        };
        registrations.remove(id);
        registrations.add(id, updated);
        true;
      };
    };
  };

  public query func getRegistrationCount() : async Nat {
    registrations.size();
  };

  public query func getRegistrations() : async [Registration.Registration] {
    let arr = registrations.values().toArray();
    arr.sort();
  };

  public query func getRegistrationByAdmissionNumber(admissionNumber : Text) : async ?Registration.Registration {
    switch (admissionNumbers.get(admissionNumber)) {
      case (?id) { registrations.get(id) };
      case null { null };
    };
  };

  public shared func deleteRegistration(id : Nat) : async Bool {
    switch (registrations.get(id)) {
      case (?reg) {
        registrations.remove(id);
        admissionNumbers.remove(reg.admissionNumber);
        true;
      };
      case null { false };
    };
  };

  public query func isCallerAdmin() : async Bool {
    false;
  };
};
