import { Timestamp } from 'firebase/firestore';
import { useFormik } from 'formik';
import { Button, Form, Modal } from 'react-bootstrap';
import DashboardContext from '../../contexts/DashboardContext';
import { useContext } from 'react';
import OrganizationInterface from '@interfaces/organization';

interface Props {
    show: boolean;
    toggle: () => void;
}

const CreateOrganizationModal = ({ show, toggle }: Props) => {
    const { uid, addOrganization } = useContext(DashboardContext);
    const {
        handleChange,
        handleSubmit,
        isSubmitting,
        values: { name, about },
    } = useFormik<OrganizationInterface>({
        initialValues: {
            name: '',
            joined: Timestamp.now(),
            lastUpdated: Timestamp.now(),
            website: '',
            about: '',
            phone: 0,
            email: '',
            members: {
                [uid]: {
                    isModerator: true,
                    isBlocked: false,
                    isOwner: true,
                    isMember: true,
                    addedBy: uid,
                    blockedBy: '',
                    joined: Timestamp.now(),
                    lastUpdated: Timestamp.now(),
                },
            },
        },
        onSubmit: async (value, { resetForm }) => {
            if (value) {
                await addOrganization(value);
                toggle();
                resetForm();
            }
        },
    });
    return (
        <Modal show={show} onHide={toggle} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Start An Organization</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Organization Name</Form.Label>
                        <Form.Control
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your organization name"
                            value={name}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>About Your Organization</Form.Label>
                        <Form.Control
                            id="about"
                            name="about"
                            type="text"
                            as="textarea"
                            placeholder="Enter a description of your organization"
                            value={about}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Button type="submit">Start Organization</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateOrganizationModal;
