import { useFormik } from 'formik';
import { useContext } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import DashboardContext from '../../contexts/DashboardContext';

const EditAccountForm: StyledComponent = styled(
    ({ className }: { className: string }) => {
        const { updateDisplayName, displayNames, uid } =
            useContext(DashboardContext);
        const {
            handleChange,
            handleSubmit,
            isSubmitting,
            values: { displayName },
        } = useFormik<{ displayName: string }>({
            initialValues: { displayName: displayNames[uid] },
            onSubmit: async ({ displayName }) =>
                await updateDisplayName(displayName),
        });
        return (
            <Form onSubmit={handleSubmit} className={className}>
                <Form.Group className="mb-3">
                    <Form.Label>Display Name</Form.Label>
                    <InputGroup>
                        <Form.Control
                            id="displayName"
                            name="displayName"
                            placeholder="Enter your display name"
                            type="text"
                            onChange={handleChange}
                            value={displayName}
                            required
                            disabled={isSubmitting}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            Save Changes
                        </Button>
                    </InputGroup>
                </Form.Group>
            </Form>
        );
    }
)(style);

export default EditAccountForm;
