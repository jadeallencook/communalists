import { Accordion, Button, Form, Modal } from 'react-bootstrap';
import { LOCATIONS } from '@objects/locations';
import { LANGUAGES } from '@objects/languages';
import { CONTACT_METHODS } from '@objects/contact-methods';
import { REQUEST_STAGES } from '@objects/stages';
import { useContext, useState } from 'react';
import { RequestStageKeyType } from '@custom-types/stages';
import Comments from './Comments';
import style from './style';
import styled, { StyledComponent } from 'styled-components';
import { FrontendRequestInterface } from '@interfaces/request';
import CopyLinkButton from './CopyLinkButton';
import VolunteerForm from '@forms/VolunteerForm';
import DashboardContext from '../../contexts/DashboardContext';

const ViewRequestForm: StyledComponent = styled(
    ({
        className,
        uid,
        request,
        handler,
        selected,
        isModal = false,
    }: {
        className: string;
        uid: string;
        request: FrontendRequestInterface;
        handler?: (id?: string, shouldRefetch?: boolean) => void;
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
            coordinator,
        } = request;

        const [stage, setStage] = useState<RequestStageKeyType>(request.stage);
        const { updateRequestStage, isLoading } = useContext(DashboardContext);

        const handleSubmitModal = async () => {
            await updateRequestStage(selected, stage);
            handler(null, true);
        };

        const handleSubmit = async () => {
            await updateRequestStage(selected, stage);
        };
        const save = async () => {
            isModal ? handleSubmitModal() : handleSubmit();
        };

        const requestLink = `${window.location.origin}/#/view-request/${uid}`;

        return (
            <div className={className}>
                <Accordion alwaysOpen>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Information</Accordion.Header>
                        <Accordion.Body>
                            {isModal && (
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Request Link{' '}
                                        <a href={requestLink} target="_blank">
                                            (Open)
                                        </a>
                                    </Form.Label>
                                    <Form.Control
                                        defaultValue={requestLink}
                                        disabled
                                    />
                                </Form.Group>
                            )}
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control defaultValue={name} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Spoken Language</Form.Label>
                                <Form.Select defaultValue={language} disabled>
                                    {Object.entries(LANGUAGES).map(
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
                                    {Object.entries(LOCATIONS).map(
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
                                    {Object.entries(CONTACT_METHODS).map(
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
                            <Comments id={selected} type="request" />
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
                                            event.target
                                                .value as RequestStageKeyType
                                        )
                                    }
                                >
                                    {Object.entries(REQUEST_STAGES).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
                            </Form.Group>
                            <VolunteerForm
                                label="Assigned Driver"
                                volunteer={driver}
                                requestId={selected}
                                type="driver"
                                collection="requests"
                            />
                            <VolunteerForm
                                label="Request Coordinator"
                                volunteer={coordinator}
                                requestId={selected}
                                type="coordinator"
                                collection="requests"
                            />
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
                                disabled={isLoading}
                            >
                                Close
                            </Button>
                        </>
                    )}
                    <Button
                        variant="primary"
                        onClick={save}
                        disabled={isLoading}
                    >
                        Save Changes
                    </Button>
                </Modal.Footer>
            </div>
        );
    }
)(style);
export default ViewRequestForm;
