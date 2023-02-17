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

const SignUpForm: StyledComponent = styled(({ className }) => {
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);
    const { snippet } = useContext(SnippetContext);
    const {
        handleChange,
        handleSubmit,
        isSubmitting,
        values: { name, email, location, details },
    } = useFormik<VolunteerApplicationInterface>({
        initialValues: {
            name: '',
            email: '',
            location: 'san-jose-downtown-ca',
            details: '',
            approved: {},
            timestamp: Timestamp.fromDate(new Date()),
            isApproved: false,
        },
        onSubmit: async (values: VolunteerApplicationInterface) => {
            const response = await addApplication(values);
            if (response?.id) {
                setSuccess(true);
            } else {
                // add failure screen
            }
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
