import { FrontendActionInterface } from '@interfaces/action';
import { Timestamp } from 'firebase/firestore';
import { useFormik } from 'formik';
import { Button, Form, Modal } from 'react-bootstrap';
import DashboardContext from '../../contexts/DashboardContext';
import { useContext } from 'react';

interface Props {
    show: boolean;
    toggle: () => void;
}

const CreateActionModal = ({ show, toggle }: Props) => {
    const { myOrganizations, organizations, uid, addAction } =
        useContext(DashboardContext);
    const {
        handleChange,
        handleSubmit,
        isSubmitting,
        values: { body, title, organization },
    } = useFormik<FrontendActionInterface>({
        initialValues: {
            title: '',
            body: '',
            stage: 'submitted',
            timestamp: Timestamp.fromDate(new Date()),
            coordinator: '',
            organization: myOrganizations[0],
            createdBy: uid,
        },
        onSubmit: async (value, { resetForm }) => {
            if (value) {
                await addAction(value);
                toggle();
                resetForm();
            }
        },
    });
    return (
        <Modal show={show} onHide={toggle} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Create New Action</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Organization</Form.Label>
                        <Form.Select
                            onChange={handleChange}
                            value={organization}
                            name="organization"
                            id="organization"
                        >
                            {myOrganizations.map((key) => (
                                <option key={key} value={key}>
                                    {organizations[key]?.name || ''}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            id="title"
                            name="title"
                            type="text"
                            placeholder="Enter action title"
                            value={title}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            id="body"
                            name="body"
                            type="text"
                            as="textarea"
                            placeholder="Enter action description"
                            value={body}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Button type="submit">Create Action</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateActionModal;
