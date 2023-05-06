import { Badge, Form, InputGroup, ListGroup } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import events from '@assets/events';
import { Time } from './components/Time';
import { Address } from './components/Address';
import { Tags } from './components/Tags';
import DayPagination from './components/DayPagination';
import { useState } from 'react';
import { daysArray, tagsArray } from '@objects/events';
import { PeriodType, TagType } from '@interfaces/events';
import locations from '@objects/locations';

const isAfterHours = (
    hour: number,
    minutes: number,
    period: PeriodType,
    current?: number
): boolean => {
    const now = new Date();
    const nowTimestamp =
        current ||
        Number(
            `${!now.getHours() ? '00' : now.getHours()}${
                !now.getMinutes() ? '00' : now.getMinutes()
            }`
        );
    const eventTimestamp = Number(
        `${period === 'pm' && hour !== 12 ? hour + 12 : hour}${
            !minutes ? '00' : minutes
        }`
    );
    return nowTimestamp >= eventTimestamp;
};

const EventsTable: StyledComponent = styled(
    ({ className }: { className: string }) => {
        const today = new Date().getDay();
        const [day, setDay] = useState(today);
        const todaysDayKey = daysArray[day];
        const isToday = day === today;
        const [tag, setTag] = useState<TagType | ''>('');
        const [afterHourFilter, setAfterHourFilter] = useState<number>(0);
        const filteredEvents = Object.entries(events).filter(
            ([, { day, tags, end }]) =>
                day.includes(todaysDayKey) &&
                (!tag || tags.includes(tag)) &&
                (!afterHourFilter ||
                    !isAfterHours(
                        end.hour,
                        end.minute,
                        end.period,
                        Number(`${afterHourFilter}00`)
                    ))
        );
        const numberOfEvents: number = filteredEvents.length;
        return (
            <>
                <DayPagination
                    day={day}
                    setDay={setDay}
                    numberOfEvents={numberOfEvents}
                />
                <Form className={className}>
                    <InputGroup>
                        <Form.Select
                            onChange={(event) =>
                                setAfterHourFilter(
                                    Number(event.target.value) as number
                                )
                            }
                            value={afterHourFilter}
                        >
                            <option value={0}>Select Time</option>
                            <option value={6}>After 6:00AM</option>
                            <option value={7}>After 7:00AM</option>
                            <option value={8}>After 8:00AM</option>
                            <option value={9}>After 9:00AM</option>
                            <option value={10}>After 10:00AM</option>
                            <option value={11}>After 11:00AM</option>
                            <option value={12}>After 12:00PM</option>
                            <option value={13}>After 1:00PM</option>
                            <option value={14}>After 2:00PM</option>
                            <option value={15}>After 3:00PM</option>
                            <option value={16}>After 4:00PM</option>
                            <option value={17}>After 5:00PM</option>
                            <option value={18}>After 6:00PM</option>
                            <option value={19}>After 7:00PM</option>
                            <option value={20}>After 8:00PM</option>
                            <option value={21}>After 9:00PM</option>
                            <option value={22}>After 10:00PM</option>
                            <option value={23}>After 11:00PM</option>
                        </Form.Select>
                        <Form.Select
                            onChange={(event) =>
                                setTag(event.target.value as TagType)
                            }
                            value={tag}
                        >
                            <option value={''}>Select Tag</option>
                            {tagsArray.map((tag) => (
                                <option value={tag} key={`filters-${tag}`}>
                                    {tag}
                                </option>
                            ))}
                        </Form.Select>
                    </InputGroup>
                </Form>
                <ListGroup className={className}>
                    {numberOfEvents ? (
                        filteredEvents?.map(
                            ([
                                id,
                                {
                                    organization,
                                    street,
                                    location,
                                    venue,
                                    tags,
                                    zipcode,
                                    start,
                                    end,
                                    website,
                                },
                            ]) => (
                                <ListGroup.Item key={id}>
                                    <div className="organization-container">
                                        <div className="fw-bold">
                                            {organization}
                                            {isToday &&
                                                isAfterHours(
                                                    end.hour,
                                                    end.minute,
                                                    end.period
                                                ) && (
                                                    <Badge bg="secondary">
                                                        CLOSED
                                                    </Badge>
                                                )}
                                        </div>
                                        <a href={website} target="_blank">
                                            {website}
                                        </a>
                                        <div>
                                            <Time start={start} end={end} />
                                        </div>
                                    </div>
                                    <div className="address-container">
                                        <div className="fw-bold">{venue}</div>
                                        <a
                                            href={`https://www.google.com/maps/place/${`${street} ${locations[location]}, CA ${zipcode}`}`}
                                            target="_blank"
                                        >
                                            <Address
                                                street={street}
                                                location={location}
                                                zipcode={zipcode}
                                            />
                                        </a>
                                    </div>
                                    <div>
                                        <Tags tags={tags} id={id} />
                                    </div>
                                    <div></div>
                                </ListGroup.Item>
                            )
                        )
                    ) : (
                        <ListGroup.Item>
                            <div className="fw-bold">
                                There are no events this day
                            </div>
                        </ListGroup.Item>
                    )}
                </ListGroup>
            </>
        );
    }
)(style);

export default EventsTable;
