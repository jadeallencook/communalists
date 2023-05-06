import { Badge, Pagination } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './DayPaginationStyle';
import { Dispatch } from 'react';
import { days, daysArray } from '@objects/events';

const DayPagination: StyledComponent = styled(
    ({
        className,
        day,
        setDay,
        numberOfEvents,
    }: {
        className: string;
        day: number;
        setDay: Dispatch<number>;
        numberOfEvents: number;
    }) => {
        const isToday = day === new Date().getDay();
        const today = daysArray[day];
        const previous = day - 1 < 0 ? 6 : day - 1;
        const next = day + 1 > 6 ? 0 : day + 1;
        const yesterday = daysArray[previous];
        const tomorrow = daysArray[next];
        return (
            <Pagination className={className}>
                <Pagination.Item onClick={() => setDay(previous)}>
                    {isToday ? 'Yesterday' : yesterday}
                </Pagination.Item>
                <Pagination.Item disabled>
                    {isToday ? 'Today' : today}{' '}
                    <Badge bg="dark">{numberOfEvents}</Badge>
                </Pagination.Item>
                <Pagination.Item onClick={() => setDay(next)}>
                    {isToday ? 'Tomorrow' : tomorrow}
                </Pagination.Item>
            </Pagination>
        );
    }
)(style);

export default DayPagination;
