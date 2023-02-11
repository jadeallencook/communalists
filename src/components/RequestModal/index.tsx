import {
    Badge,
    Button,
    Form,
    Modal,
    OverlayTrigger,
    Tooltip,
} from 'react-bootstrap';
import locations from '@objects/locations';
import languages from '@objects/languages';
import methods from '@objects/methods';
import timestampToDateString from '@utils/timestamp-to-date-string';
import RequestAidInterface from '@interfaces/request-aid';
import stages from '@objects/stages';
import { useState } from 'react';
import { StageKeyType } from '@custom-types/stages';
import updateRequestStage from '@api/update-request-stage';
import Comments from './Comments';
import Driver from './Driver';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import CalendarSVG from '@assets/calendar.svg';

const RequestModal = ({
    show,
    handler,
    request,
    selected,
}: {
    show: boolean;
    handler: (id?: string) => void;
    request: RequestAidInterface;
    selected: string;
}) => {
    const {
        name,
        language,
        location,
        email,
        phone,
        method,
        health,
        needs,
        timestamp,
        driver,
    } = request;
    const [stage, setStage] = useState<StageKeyType>(request.stage);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const save = async () => {
        setSubmitting(true);
        await updateRequestStage(selected, stage);
        setSubmitting(false);
        handler();
    };
    return (
        <Modal show={show} onHide={handler} size="lg">
            <Modal.Header closeButton>
                <Modal.Title
                    style={{
                        color: 'var(--primary)',
                        fontWeight: '900',
                        textTransform: 'capitalize',
                    }}
                >
                    Request Recieved{' '}
                    <b>{getNumberOfDaysAfterDate(timestamp)}</b>{' '}
                    <OverlayTrigger
                        placement="right"
                        overlay={
                            <Tooltip id="tooltip-right">
                                {timestampToDateString(timestamp)}
                            </Tooltip>
                        }
                    >
                        <img src={CalendarSVG} style={{ cursor: 'pointer' }} />
                    </OverlayTrigger>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control defaultValue={name} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Spoken Language</Form.Label>
                    <Form.Select defaultValue={language} disabled>
                        {Object.entries(languages).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Select defaultValue={location} disabled>
                        {Object.entries(locations).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control defaultValue={email || 'N/A'} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control defaultValue={phone || 'N/A'} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Preferred Contact Method</Form.Label>
                    <Form.Select defaultValue={method} disabled>
                        {Object.entries(methods).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Relevant Health Conditions</Form.Label>
                    <Form.Control defaultValue={health || 'N/A'} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Request Information</Form.Label>
                    <Form.Control as="textarea" defaultValue={needs} disabled />
                </Form.Group>
                <hr />
                <Modal.Title
                    style={{ color: 'var(--primary)', fontWeight: '900' }}
                >
                    Volunteer Collaboration Hub
                </Modal.Title>
                <p>
                    Please remember to communicate in a respectful and
                    professional manner.
                </p>
                <hr />
                <Comments id={selected} />
                <Form.Group className="mb-3">
                    <Form.Label>Current Stage</Form.Label>
                    <Form.Select
                        defaultValue={stage}
                        onChange={(event) =>
                            setStage(event.target.value as StageKeyType)
                        }
                    >
                        {Object.entries(stages).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Driver driver={driver} id={selected} />
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={() => handler()}
                    disabled={submitting}
                >
                    Close
                </Button>
                <Button variant="primary" onClick={save} disabled={submitting}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RequestModal;
