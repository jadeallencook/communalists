import AccountInterface from '@interfaces/account';
import locations from '@objects/locations';
import roles from '@objects/roles';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import SnippetContext from '../../contexts/SnippetContext';
import style from './style';
import accountInitialValues from '@objects/account-initial-values';
import DashboardContext from '../../contexts/DashboardContext';

const EditAccountForm: StyledComponent = styled(
    ({ className }: { className: string }) => {
        const { updateAccount, uid, accounts } = useContext(DashboardContext);
        const account = accounts[uid];
        const {
            handleChange,
            handleSubmit,
            isSubmitting,
            values: { name, location, role },
        } = useFormik<AccountInterface>({
            initialValues: { ...accountInitialValues, ...account },
            onSubmit: async (value: AccountInterface) => {
                const role = Object.keys(value.role).reduce(
                    (object, key) => {
                        const isBoolean = typeof value.role[key] === 'boolean';
                        return {
                            ...object,
                            [key]: isBoolean
                                ? value.role[key]
                                : !!value.role[key].length,
                        };
                    },
                    { ...accountInitialValues.role }
                );
                await updateAccount(uid, { ...value, role });
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
                    <Form.Label>
                        {snippet('role.label', 'sign-up-form')}
                    </Form.Label>
                    <br />
                    {Object.entries(roles).map(([key, value]) => {
                        return (
                            <Form.Check
                                type="checkbox"
                                label={value}
                                key={key}
                                id={key}
                                name={`role.${key}`}
                                onChange={handleChange}
                                defaultChecked={role?.[key]}
                                disabled={isSubmitting}
                            />
                        );
                    })}
                </Form.Group>
                {saved && (
                    <Form.Group className="mb-3">
                        <Alert variant="success">
                            Your changes have been saved.
                        </Alert>
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
