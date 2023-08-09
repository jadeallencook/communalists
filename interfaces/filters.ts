import { DriverKeyType } from '../types/driver';
import { LanguageKeyType } from '../types/languages';
import { LocationKeyType } from '../types/locations';
import { RequestStageKeyType, ActionStageKeyType } from '../types/stages';

export interface FormFilterInterface {
    name: string;
    value: string;
    options?: { [key: string]: string };
    defaultValue?: string;
}

export interface SharedFiltersInterface {
    coordinator: string;
    organization: string;
}

export interface RequestFiltersInterface extends SharedFiltersInterface {
    location: LocationKeyType | '';
    language: LanguageKeyType | '';
    driver: DriverKeyType | '';
    stage: RequestStageKeyType | '';
}

export interface ActionFiltersInterface extends SharedFiltersInterface {
    stage: ActionStageKeyType | '';
}

export type AnyFiltersInterface =
    | RequestFiltersInterface
    | ActionFiltersInterface;
