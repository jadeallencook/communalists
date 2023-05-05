import authSignIn from '@api/auth-sign-in';
import { useFormik } from 'formik';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SnippetContext from '../../contexts/SnippetContext';
import Loading from '@components/Loading';
import DashboardContext from '../../contexts/DashboardContext';

const SignInForm: StyledComponent = styled(({ className }) => {
    const [error, setError] = useState<string>('');
    const { snippet } = useContext(SnippetContext);
    const { signIn } = useContext(DashboardContext);
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
            signIn(email, password);
        },
    });
    return isSubmitting ? (
        <Loading />
    ) : (
        <Form onSubmit={handleSubmit} className={className}>
            <h1>{snippet('header', 'log-in-form')}</h1>
            <p>{snippet('description', 'log-in-form')}</p>
            <Form.Group className="mb-3">
                <Form.Label>{snippet('email.label')}</Form.Label>
                <Form.Control
                    id="email"
                    name="email"
                    type="email"
                    placeholder={snippet('email.placeholder', 'log-in-form')}
                    onChange={handleChange}
                    value={email}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>{snippet('password.label')}</Form.Label>
                <Form.Control
                    id="password"
                    name="password"
                    type="password"
                    placeholder={snippet('password.placeholder')}
                    onChange={handleChange}
                    value={password}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                {error && <Alert variant="danger">{error}</Alert>}
                <Button type="submit">
                    {snippet('button', 'log-in-form')}
                </Button>
                <Link to="/sign-up">
                    <Button variant="secondary">
                        {snippet('sign-up.button', 'log-in-form')}
                    </Button>
                </Link>
            </Form.Group>
        </Form>
    );
})(style);

export default SignInForm;
