import { Accordion, Button, Form, Modal } from 'react-bootstrap';
import locations from '@objects/locations';
import languages from '@objects/languages';
import methods from '@objects/methods';
import stages from '@objects/stages';
import { useState } from 'react';
import { StageKeyType } from '@custom-types/stages';
import updateRequestStage from '@api/update-request-stage';
import Comments from './Comments';
import Driver from './Driver';
import style from './style';
import styled, { StyledComponent } from 'styled-components';
import RequestAidInterface from '@interfaces/request-aid';
import CopyLinkButton from './CopyLinkButton';

const ViewRequestForm: StyledComponent = styled(
    ({
        className,
        request,
        handler,
        selected,
        isModal = false,
    }: {
        className: string;
        request: RequestAidInterface;
        handler?: (id?: string) => void;
        selected: string;
        isModal?: boolean;
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
            driver,
        } = request;

        const [stage, setStage] = useState<StageKeyType>(request.stage);
        const [submitting, setSubmitting] = useState<boolean>(false);

        const handleSubmitModal = async () => {
            setSubmitting(true);
            await updateRequestStage(selected, stage);
            setSubmitting(false);
            handler();
        };

        const handleSubmit = async () => {
            setSubmitting(true);
            await updateRequestStage(selected, stage);
            setSubmitting(false);
        };
        const save = async () => {
            isModal ? handleSubmitModal() : handleSubmit();
        };

        return (
            <div className={className}>
                <Accordion>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Information</Accordion.Header>
                        <Accordion.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control defaultValue={name} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Spoken Language</Form.Label>
                                <Form.Select defaultValue={language} disabled>
                                    {Object.entries(languages).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Select defaultValue={location} disabled>
                                    {Object.entries(locations).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    defaultValue={email || 'N/A'}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    defaultValue={phone || 'N/A'}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Preferred Contact Method
                                </Form.Label>
                                <Form.Select defaultValue={method} disabled>
                                    {Object.entries(methods).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Relevant Health Conditions
                                </Form.Label>
                                <Form.Control
                                    defaultValue={health || 'N/A'}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Request Information</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    defaultValue={needs}
                                    disabled
                                />
                            </Form.Group>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Communication</Accordion.Header>
                        <Accordion.Body>
                            <Comments id={selected} />
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>Coordination</Accordion.Header>
                        <Accordion.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Current Stage</Form.Label>
                                <Form.Select
                                    defaultValue={stage}
                                    onChange={(event) =>
                                        setStage(
                                            event.target.value as StageKeyType
                                        )
                                    }
                                >
                                    {Object.entries(stages).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
                            </Form.Group>
                            <Driver driver={driver} id={selected} />
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>

                <Modal.Footer>
                    {isModal && (
                        <>
                            <CopyLinkButton path={`view-request/${selected}`} />
                            <Button
                                variant="secondary"
                                onClick={() => handler()}
                                disabled={submitting}
                            >
                                Close
                            </Button>
                        </>
                    )}
                    <Button
                        variant="primary"
                        onClick={save}
                        disabled={submitting}
                    >
                        Save Changes
                    </Button>
                </Modal.Footer>
            </div>
        );
    }
)(style);
export default ViewRequestForm;
