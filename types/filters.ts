import { DriverTypes } from "./driver";
import { LanguageTypes } from "./languages";
import { LocationType } from "./locations";
import { StageType } from "./stages";

export type FiltersType = {
    location: LocationType | '',
    language: LanguageTypes | '',
    driver: DriverTypes | '',
    stage: StageType | ''
};
