import { DayKeyType, FrequencyType } from '@interfaces/events';
import { days, daysArray } from '@objects/events';

const getThisOrNextForDay = (offset: number) => (offset > 0 ? 'This' : 'Next');

const getDaysAwayInWeek = (day: DayKeyType) => {
    const today = new Date().getDay();
    const offset = daysArray.indexOf(day) - today;
    if (!offset) {
        return 'Today';
    } else if (offset === 1) {
        return 'Tomorrow';
    } else if (day === 'sun' && offset == -6) {
        return 'Tomorrow';
    } else if (day === 'sun' && offset) {
        return `This ${days[day]}`;
    } else {
        return `${getThisOrNextForDay(offset)} ${days[day]}`;
    }
};

export const Day = ({
    frequency,
    day,
}: {
    frequency: FrequencyType;
    day: number | DayKeyType | DayKeyType[];
}) => {
    const isString = typeof day === 'string';
    const isArray = typeof day === 'object';
    const isNumber = typeof day === 'number';

    if (frequency === 'weekly' && isString) {
        return <>{getDaysAwayInWeek(day)}</>;
    }

    if (frequency === 'weekly' && isArray) {
    }

    if (frequency === 'monthly' && isNumber) {
    }

    if (frequency === 'monthly' && isString) {
    }

    return null;
};
