import { useFormik } from 'formik';
import { Alert, Button, Container, Form, Spinner } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { useContext, useState } from 'react';
import SnippetContext from '../../contexts/SnippetContext';
import locations from '@objects/locations';
import VolunteerApplicationInterface from '@interfaces/volunteer-application';
import addApplication from '@api/add-application';
import { Timestamp } from 'firebase/firestore';
import roles from '@objects/roles';
import organizations from '@objects/organizations';

const SignUpForm: StyledComponent = styled(({ className }) => {
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);
    const { snippet } = useContext(SnippetContext);
    const {
        handleChange,
        handleSubmit,
        isSubmitting,
        values: {
            name,
            username,
            email,
            location,
            details,
            role,
            organization,
        },
    } = useFormik<VolunteerApplicationInterface>({
        initialValues: {
            name: '',
            username: '',
            email: '',
            location: 'santa-clara-ca',
            details: '',
            approved: '',
            timestamp: Timestamp.fromDate(new Date()),
            role: {
                driver: false,
                coordinator: false,
                'social-media': false,
                'tech-support': false,
            },
            organization: 'NONE',
        },
        onSubmit: async (values: VolunteerApplicationInterface) => {
            await addApplication(values);
            setSuccess(true);
        },
    });
    return isSubmitting ? (
        <Container className={className}>
            <Spinner animation="border" />
        </Container>
    ) : !success ? (
        <Form onSubmit={handleSubmit} className={className}>
            <h1>{snippet('header', 'sign-up-form')}</h1>
            <p>{snippet('description', 'sign-up-form')}</p>
            <Form.Group className="mb-3">
                <Form.Label>{snippet('name.label')}</Form.Label>
                <Form.Control
                    id="name"
                    name="name"
                    type="text"
                    placeholder={snippet('name.placeholder')}
                    onChange={handleChange}
                    value={name}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>{snippet('username.label')}</Form.Label>
                <Form.Control
                    id="username"
                    name="username"
                    type="text"
                    placeholder={snippet('username.placeholder')}
                    onChange={handleChange}
                    value={username}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>{snippet('email.label')}</Form.Label>
                <Form.Control
                    id="email"
                    name="email"
                    type="email"
                    placeholder={snippet('email.placeholder')}
                    onChange={handleChange}
                    value={email}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>{snippet('location.label')}</Form.Label>
                <Form.Select
                    onChange={handleChange}
                    value={location}
                    name="location"
                    id="location"
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
                    {snippet('organization.label', 'sign-up-form')}
                </Form.Label>
                <Form.Select
                    onChange={handleChange}
                    value={organization}
                    name="organization"
                    id="organization"
                >
                    {Object.entries(organizations).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>{snippet('role.label', 'sign-up-form')}</Form.Label>
                {Object.entries(roles).map(([key, value]) => (
                    <Form.Check
                        type="checkbox"
                        label={value}
                        key={key}
                        id={key}
                        name={`role.${key}`}
                        onChange={handleChange}
                        value={+role[key]}
                    />
                ))}
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>
                    {snippet('details.label', 'sign-up-form')}
                </Form.Label>
                <Form.Control
                    as="textarea"
                    id="details"
                    name="details"
                    type="text"
                    placeholder={snippet('details.placeholder', 'sign-up-form')}
                    onChange={handleChange}
                    value={details}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                {error && <Alert variant="danger">{error}</Alert>}
                <Button type="submit">
                    {snippet('button', 'sign-up-form')}
                </Button>
            </Form.Group>
        </Form>
    ) : (
        <Container className={className}>
            <h1>{snippet('success.header', 'sign-up-form')}</h1>
            <p>{snippet('success.description', 'sign-up-form')}</p>
        </Container>
    );
})(style);

export default SignUpForm;
