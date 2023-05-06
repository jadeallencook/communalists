import { LocationKeyType } from '@custom-types/locations';

export type HourType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type MinuteType = 0 | 15 | 30 | 45;
export type PeriodType = 'am' | 'pm';
export type TagType =
    | 'shower'
    | 'food'
    | 'essentials'
    | 'medical'
    | 'haircut'
    | 'recovery'
    | 'legal'
    | 'mail'
    | 'groceries';
export type DayKeyType = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export type DayType =
    | 'Sunday'
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday';
export type FrequencyType = 'monthly' | 'weekly';

export default interface EventInterface {
    organization: string;
    description?: string;
    tags: TagType[];
    venue: string;
    location: LocationKeyType;
    street: string;
    zipcode: number;
    isReligious: boolean;
    start: {
        hour: HourType;
        minute: MinuteType;
        period: PeriodType;
    };
    end: {
        hour: HourType;
        minute: MinuteType;
        period: PeriodType;
    };
    frequency: FrequencyType;
    day: DayKeyType[];
    monthlyDayPosition?: 1 | 2 | 3 | 4;
    website: string;
}
