import { useFormik } from 'formik';
import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import SnippetContext from '../../contexts/SnippetContext';
import Loading from '@components/Loading';
import { useSignIn } from '@api/auth';

const SignInForm: StyledComponent = styled(({ className }) => {
    const { snippet } = useContext(SnippetContext);
    const { signIn } = useSignIn();
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
        onSubmit: (values) => signIn(values),
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
                <Button type="submit">
                    {snippet('button', 'log-in-form')}
                </Button>
                <Link to="/forgot-password">Forget Password</Link>
                <Link to="/sign-up">
                    {snippet('sign-up.button', 'log-in-form')}
                </Link>
            </Form.Group>
        </Form>
    );
})(style);

export default SignInForm;
