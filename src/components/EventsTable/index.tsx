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

const isAfterHours = (hour: number, minutes: number, period: PeriodType) => {
    const now = new Date();
    const nowTimestamp = Number(
        `${!now.getHours() ? '00' : now.getHours()}${
            !now.getMinutes() ? '00' : now.getMinutes()
        }`
    );
    const eventTimestamp = Number(
        `${period === 'pm' ? hour + 12 : hour}${!minutes ? '00' : minutes}`
    );
    return nowTimestamp > eventTimestamp ? (
        <Badge bg="secondary">CLOSED</Badge>
    ) : null;
};

const EventsTable: StyledComponent = styled(
    ({ className }: { className: string }) => {
        const today = new Date().getDay();
        const [day, setDay] = useState(today);
        const todaysDayKey = daysArray[day];
        const isToday = day === today;
        const [tag, setTag] = useState<TagType | ''>('');
        const [religious, setReligious] = useState<string>('');
        const filteredEvents = Object.entries(events).filter(
            ([, { day, tags, isReligious }]) =>
                day.includes(todaysDayKey) &&
                (!tag || tags.includes(tag)) &&
                (!religious ||
                    (religious === 'not-religious' && !isReligious) ||
                    (religious === 'religious' && isReligious))
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
                                setReligious(event.target.value as string)
                            }
                            value={religious}
                        >
                            <option value="">
                                Select Religious Preference
                            </option>
                            <option value="religious">Is Religious</option>
                            <option value="not-religious">
                                Is Not Religious
                            </option>
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
                                            {isToday
                                                ? isAfterHours(
                                                      end.hour,
                                                      end.minute,
                                                      end.period
                                                  )
                                                : null}
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
