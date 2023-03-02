import updateMyAccount from '@api/update-my-account';
import AccountInterface from '@interfaces/account';
import locations from '@objects/locations';
import organizations from '@objects/organizations';
import roles from '@objects/roles';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useQueryClient } from 'react-query';
import styled, { StyledComponent } from 'styled-components';
import SnippetContext from '../../contexts/SnippetContext';
import style from './style';

const EditAccountForm: StyledComponent = styled(
    ({
        className,
        initialValues,
    }: {
        className: string;
        setIsSubmitting: any;
        initialValues: AccountInterface;
    }) => {
        const queryClient = useQueryClient();
        const {
            handleChange,
            handleSubmit,
            isSubmitting,
            values: { name, location, role, organization },
        } = useFormik<AccountInterface>({
            initialValues,
            onSubmit: async (value) => {
                await updateMyAccount(value);
                queryClient.setQueryData('@account', value);
                setUnsaved(false);
                setSaved(true);
            },
        });
        const [unsaved, setUnsaved] = useState<boolean>(false);
        const [saved, setSaved] = useState<boolean>(false);
        const { snippet } = useContext(SnippetContext);
        const handler = () => setUnsaved(true);

        useEffect(() => {
            if (saved) {
                setTimeout(() => setSaved(false), 3000);
            }
        }, [unsaved]);
        return (
            <Form
                onSubmit={handleSubmit}
                className={className}
                onChange={handler}
            >
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                        id="name"
                        name="name"
                        type="text"
                        onChange={handleChange}
                        value={name}
                        required
                        disabled={isSubmitting}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>{snippet('location.label')}</Form.Label>
                    <Form.Select
                        onChange={handleChange}
                        value={location}
                        name="location"
                        id="location"
                        disabled={isSubmitting}
                    >
                        {Object.entries(locations).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Organization</Form.Label>
                    <Form.Select
                        onChange={handleChange}
                        value={organization}
                        name="organization"
                        id="organization"
                        disabled={isSubmitting}
                    >
                        {Object.entries(organizations).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>
                        {snippet('role.label', 'sign-up-form')}
                    </Form.Label>
                    {Object.entries(roles).map(([key, value]) => (
                        <Form.Check
                            type="checkbox"
                            label={value}
                            key={key}
                            id={key}
                            name={`role.${key}`}
                            onChange={handleChange}
                            defaultChecked={role[key]}
                            disabled={isSubmitting}
                        />
                    ))}
                </Form.Group>
                {saved && (
                    <Form.Group className="mb-3">
                        <Alert>Your changes have been saved.</Alert>
                    </Form.Group>
                )}
                <Form.Group className="mb-3">
                    <Button type="submit" disabled={isSubmitting || !unsaved}>
                        Save Changes
                    </Button>
                </Form.Group>
            </Form>
        );
    }
)(style);

export default EditAccountForm;
