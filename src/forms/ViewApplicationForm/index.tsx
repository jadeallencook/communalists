import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import locations from '@objects/locations';
import style from './style';
import styled, { StyledComponent } from 'styled-components';
import { Dispatch, useState } from 'react';
import roles from '@objects/roles';
import AccountInterface from '@interfaces/account';
import approveAccount from '@api/approve-account';
import { useFormik } from 'formik';

const ViewApplicationForm: StyledComponent = styled(
    ({
        className,
        application,
        setUID,
        uid,
    }: {
        className: string;
        application: AccountInterface;
        setUID: Dispatch<string>;
        uid: string;
    }) => {
        const { name, location, bio, role } = application;
        const [success, setSuccess] = useState<boolean>(false);

        const {
            handleSubmit,
            isSubmitting,
            values: {},
        } = useFormik<{}>({
            initialValues: {},
            onSubmit: () => approveAccount(uid).then(() => setSuccess(true)),
        });

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
                    <Form.Control as="textarea" defaultValue={bio} disabled />
                </Form.Group>

                <Modal.Footer>
                    <Form
                        onSubmit={handleSubmit}
                        className={`${className} animate__animated animate__fadeIn`}
                    >
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting || success}
                        >
                            {success
                                ? 'Approved'
                                : isSubmitting
                                ? ''
                                : 'Approve'}
                            {isSubmitting && (
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    style={{ marginLeft: '5px' }}
                                />
                            )}
                        </Button>
                    </Form>
                    <Button variant="secondary" onClick={() => setUID('')}>
                        Close
                    </Button>
                </Modal.Footer>
            </div>
        );
    }
)(style);
export default ViewApplicationForm;
