export interface Address {
    Address: string;
    City: string;
    State: string;
    TypeCode?: string;
    TypeDescription?: string;
    ZipCode: string;
    ZipExt: string;
}

export interface Demographics {
    Age: number;
    Birthdate: string;
    Contact1PhoneNumber: string;
    Contact1Title: string;
    Contact2PhoneNumber: string;
    Contact2Title: string;
    CorrespondenceLanguageCode: string;
    CorrespondenceLanguageDescription?: string;
    CounselorEmailAddress?: string;
    CounselorName?: string;
    CounselorNumber: number;
    DisplayText: string;
    DoNotRelease: string;
    EmailAddress: string;
    EthnicityCode: string;
    EthnicityDescription: string;
    FirstName: string;
    Gender: string;
    Grade: string;
    IsSecondary: boolean;
    LanguageFluencyCode: string;
    LanguageFluencyDescription: string;
    LastName: string;
    LockerCombination: string;
    LockerLocation: string;
    LockerNumber: string;
    LockerPosition: string;
    MailingAddress: Address;
    MiddleName: string;
    MobilePhone: string;
    ParentGuardianEmailAddress: string;
    ParentGuardianName: string;
    PrimaryPhoneNumber: string;
    RaceCode: string;
    RaceDescription: string;
    ResidenceAddress: Address;
    SchoolCode: number;
    SchoolName: string;
    StudentID: number;
}
  
export interface View {
    CanViewDetails: boolean;
    ViewCode: string;
    ViewDescription: string;
}  

export interface Student {
    Demographics: Demographics;
    HideWhatIf: boolean;
    UseFlexibleScheduling: boolean;
    Views: View[];
}

export interface PasswordRequirement {
    DifferentThanOld: boolean;
    MinimumLength: number;
    RequireLettersAndNumbers: boolean;
    RequireSpecialCharacter: boolean;
    RequireUpperLowerCases: boolean;
}
  

export interface PasswordRule {
    PasswordExpireInDays: number;
    PasswordRequirement: PasswordRequirement;
    RequirePasswordChange: boolean;
    RequirePasswordChangeMessage: string;
}  

export interface AuthResponseData {
    AccessToken: string;
    AeriesCommunications: boolean;
    DefaultStudentID: number;
    ErrorMessage?: string;
    PasswordRule: PasswordRule;
    RefreshToken: string;
    SignalKit: boolean;
    Status?: string;
    Students: Student[];
    Titan: boolean;
    UserType: string;
}
  

export interface Assignment {
    name: string;
    percent: number;
    duedate: number;
    score: number;
    total: number;
    graded: boolean;
    category: string;
    description: string;
    classname?: string;  
}