import { Button, Form, Modal } from 'react-bootstrap';
import locations from '@objects/locations';
import style from './style';
import styled, { StyledComponent } from 'styled-components';
import VolunteerApplicationInterface from '@interfaces/volunteer-application';
import { Dispatch } from 'react';
import roles from '@objects/roles';
import organizations from '@objects/organizations';

const ViewApplicationForm: StyledComponent = styled(
    ({
        className,
        application,
        setApplication,
    }: {
        className: string;
        application: VolunteerApplicationInterface;
        setApplication: Dispatch<VolunteerApplicationInterface>;
    }) => {
        const { name, location, email, details, role, organization } =
            application;

        return (
            <div className={className}>
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control defaultValue={name} disabled />
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
                    <Form.Label>Organization</Form.Label>
                    <Form.Select defaultValue={organization} disabled>
                        {Object.entries(organizations).map(([key, value]) => (
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
                    <Form.Label>Roles</Form.Label>
                    {Object.entries(roles).map(([key, value]) => (
                        <Form.Check
                            type="checkbox"
                            label={value}
                            key={key}
                            id={key}
                            defaultChecked={role[key]}
                            disabled
                        />
                    ))}
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>
                        Why do you want to become a volunteer?
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        defaultValue={details}
                        disabled
                    />
                </Form.Group>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setApplication(null)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </div>
        );
    }
)(style);
export default ViewApplicationForm;
