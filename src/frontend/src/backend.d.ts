import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RegistrationInput {
    tShirtShortsSize: string;
    studentName: string;
    dobMonth: bigint;
    dobDate: bigint;
    food: string;
    game: string;
    dobYear: bigint;
    mobileNo: string;
    blazerSize: string;
    shoeSize: string;
    motherName: string;
    admissionNumber: string;
    fatherName: string;
    gender: string;
    trackSuitSize: string;
    studentClass: string;
    ageGroup: string;
}
export interface UserProfile {
    name: string;
}
export type Time = bigint;
export interface Registration {
    id: bigint;
    tShirtShortsSize: string;
    studentName: string;
    dobMonth: bigint;
    dobDate: bigint;
    food: string;
    game: string;
    dobYear: bigint;
    mobileNo: string;
    blazerSize: string;
    shoeSize: string;
    motherName: string;
    admissionNumber: string;
    fatherName: string;
    gender: string;
    timestamp: bigint;
    trackSuitSize: string;
    studentClass: string;
    ageGroup: string;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    generateInviteCode(): Promise<string>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getRegistrationCount(): Promise<bigint>;
    getRegistrations(): Promise<Array<Registration>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    submitRegistration(input: RegistrationInput): Promise<bigint>;
}
