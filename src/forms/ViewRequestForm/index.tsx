import { Accordion, Button, Form, Modal, Row } from 'react-bootstrap';
import locations from '@objects/locations';
import languages from '@objects/languages';
import methods from '@objects/methods';
import stages from '@objects/stages';
import { useContext, useState } from 'react';
import { StageKeyType } from '@custom-types/stages';
import updateRequestStage from '@api/update-request-stage';
import Comments from './Comments';
import style from './style';
import styled, { StyledComponent } from 'styled-components';
import RequestAidInterface from '@interfaces/request-aid';
import CopyLinkButton from './CopyLinkButton';
import VolunteerForm from '@forms/VolunteerForm';
import DashboardContext from '../../contexts/DashboardContext';

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
        handler?: (id?: string, shouldRefetch?: boolean) => void;
        selected: string;
        isModal?: boolean;
    }) => {
        const {
            subjectPronoun = 'they',
            objectPronoun = 'them',
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

        const [stage, setStage] = useState<StageKeyType>(request.stage);
        const { updateStage, isLoading } = useContext(DashboardContext);

        const handleSubmitModal = async () => {
            await updateStage(selected, stage);
            handler(null, true);
        };

        const handleSubmit = async () => {
            await updateStage(selected, stage);
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
                                <Form.Label>Pronouns</Form.Label>
                                <Row className="pronouns-field-container">
                                    <Form.Control
                                        className="pronouns-field-control"
                                        defaultValue={subjectPronoun}
                                        disabled
                                    />
                                    /
                                    <Form.Control
                                        className="pronouns-field-control"
                                        defaultValue={objectPronoun}
                                        disabled
                                    />
                                </Row>
                            </Form.Group>
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
