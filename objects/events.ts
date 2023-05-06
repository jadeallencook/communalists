import { DayKeyType, DayType, TagType } from '@interfaces/events';

export const days: { [key in DayKeyType]: DayType } = {
    sun: 'Sunday',
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
};

export const daysArray: DayKeyType[] = [
    'sun',
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
];

export const tagsArray: TagType[] = [
    'shower',
    'food',
    'essentials',
    'medical',
    'haircut',
    'recovery',
    'legal',
    'mail',
    'groceries',
];
