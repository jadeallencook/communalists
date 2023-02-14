import { DriverKeyType } from "./driver";
import { LanguageKeyType } from "./languages";
import { LocationKeyType } from "./locations";
import { StageKeyType } from "./stages";

export type FiltersType = {
    location: LocationKeyType | '',
    language: LanguageKeyType | '',
    driver: DriverKeyType | '',
    stage: StageKeyType | ''
};
