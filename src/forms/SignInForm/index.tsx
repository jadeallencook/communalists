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
            <h1>Sign In</h1>
            <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    id="email"
                    name="email"
                    type="email"
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
                    onChange={handleChange}
                    value={password}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                {error && <Alert variant="danger">{error}</Alert>}
                <Button type="submit">Sign In</Button>
            </Form.Group>
        </Form>
    );
})(style);

export default SignInForm;
