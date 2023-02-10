import { Button, Form, Modal } from 'react-bootstrap';
import locations from '@objects/locations';
import languages from '@objects/languages';
import methods from '@objects/methods';
import timestampToDateString from '@utils/timestamp-to-date-string';
import RequestAidInterface from '@interfaces/request-aid';
import stages from '@objects/stages';
import { useState } from 'react';
import { StageKeyType } from '@custom-types/stages';
import updateRequestStage from '@api/update-request-stage';

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
        submitted,
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
                <Modal.Title>
                    Request <b>({timestampToDateString(submitted)})</b>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control defaultValue={name} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Language</Form.Label>
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
                                {value}, CA
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control defaultValue={email} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control defaultValue={phone} disabled />
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
                    <Form.Label>Health Conditions</Form.Label>
                    <Form.Control defaultValue={health} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Information</Form.Label>
                    <Form.Control as="textarea" defaultValue={needs} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Stage</Form.Label>
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
