export interface Profile {
    name: string;
    pronouns: string;
    about: string;
    avatar: string;
    zipcode: number;
    email?: string;
    phone?: string;
    // TODO: create skill and langauge types
    skills: string[];
    languages: string[];
}
