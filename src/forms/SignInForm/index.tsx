import authSignIn from '@api/auth-sign-in';
import { useFormik } from 'formik';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import LoadingImage from '@assets/loading.gif';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignInForm: StyledComponent = styled(({ className }) => {
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const {
        handleChange,
        handleSubmit,
        isSubmitting,
        values: { email, password },
    } = useFormik<{ email: string; password: string }>({
        initialValues: {
            email: '',
            password: '',
        },
        onSubmit: async ({ email, password }) => {
            const response = await authSignIn(email, password);
            if (response.name === 'FirebaseError') {
                setError(response.code);
            } else {
                navigate('/dashboard');
            }
        },
    });
    return isSubmitting ? (
        <Container className={className}>
            <img src={LoadingImage} />
        </Container>
    ) : (
        <Form onSubmit={handleSubmit} className={className}>
            <h1>Welcome Volunteers </h1>
            <p>
                This sign in page is exclusively for those who have generously
                offered their time and resources to support our community.
            </p>
            <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    id="email"
                    name="email"
                    type="email"
                    placeholder="comrade@communalists.com"
                    onChange={handleChange}
                    value={email}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••••••••••••"
                    onChange={handleChange}
                    value={password}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                {error && <Alert variant="danger">{error}</Alert>}
                <Button type="submit">Access Your Dashboard</Button>
            </Form.Group>

            <p>
                <br />
                If you would like to become a volunteer simply send an email to{' '}
                <a href="mailto: support@communalists.com?subject=Support Request From Communalists">
                    support@communalists.com
                </a>{' '}
                and one of our team members will be in touch to discuss the next
                steps.
            </p>
        </Form>
    );
})(style);

export default SignInForm;
