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
    photoUrl?: string;
    admissionNumber: string;
    fatherName: string;
    gender: string;
    trackSuitSize: string;
    studentClass: string;
    ageGroup: string;
}
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
    photoUrl?: string;
    admissionNumber: string;
    fatherName: string;
    gender: string;
    timestamp: bigint;
    trackSuitSize: string;
    studentClass: string;
    ageGroup: string;
}
export interface backendInterface {
    deleteRegistration(id: bigint): Promise<boolean>;
    getRegistrationByAdmissionNumber(admissionNumber: string): Promise<Registration | null>;
    getRegistrationCount(): Promise<bigint>;
    getRegistrations(): Promise<Array<Registration>>;
    isCallerAdmin(): Promise<boolean>;
    submitRegistration(input: RegistrationInput): Promise<bigint>;
    updateRegistration(id: bigint, input: RegistrationInput): Promise<boolean>;
}
