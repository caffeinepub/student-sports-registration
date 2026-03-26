import Nat "mo:core/Nat";
import Order "mo:core/Order";

module {
  public type Registration = {
    id : Nat;
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
    timestamp : Int;
  };

  public func compare(reg1 : Registration, reg2 : Registration) : Order.Order {
    Nat.compare(reg1.id, reg2.id);
  };
};
