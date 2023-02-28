import { DriverKeyType } from '../types/driver';
import { LanguageKeyType } from '../types/languages';
import { LocationKeyType } from '../types/locations';
import { StageKeyType } from '../types/stages';

export interface FiltersInterface {
            location: LocationKeyType | '';
    language: LanguageKeyType | '';
    driver: DriverKeyType | '';
    stage: StageKeyType | '';
}
