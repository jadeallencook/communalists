import { useFormik } from 'formik';
import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import SnippetContext from '../../contexts/SnippetContext';
import Loading from '@components/Loading';
import authResetPassword from '@api/auth-reset-password';

const ForgotPasswordForm: StyledComponent = styled(({ className }) => {
    const { snippet } = useContext(SnippetContext);
    const [success, setSuccess] = useState<boolean>(false);
    const {
        handleChange,
        handleSubmit,
        isSubmitting,
        values: { email },
    } = useFormik<{ email: string }>({
        initialValues: {
            email: '',
        },
        onSubmit: async ({ email }) => {
            await authResetPassword(email);
            setSuccess(true);
        },
    });
    return isSubmitting ? (
        <Loading />
    ) : (
        <Form onSubmit={handleSubmit} className={className}>
            {success ? (
                <>
                    <h1>Reset Link Sent</h1>
                    <p>
                        We've sent you an email with instructions to reset your
                        password. Please check your inbox and follow the steps
                        to regain access to your account. If you don't see the
                        email, please check your spam or junk folder. If you're
                        still having trouble, please contact our support team
                        for assistance.
                    </p>
                </>
            ) : (
                <>
                    <h1>Forgot Password</h1>
                    <p>
                        If you've forgotten your password, don't worry! Enter
                        the email associated with your account and we'll send
                        you a reset link.
                    </p>
                    <Form.Group className="mb-3">
                        <Form.Label>{snippet('email.label')}</Form.Label>
                        <Form.Control
                            id="email"
                            name="email"
                            type="email"
                            placeholder={snippet(
                                'email.placeholder',
                                'log-in-form'
                            )}
                            onChange={handleChange}
                            value={email}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Button type="submit">Reset Password</Button>
                        <Link to="/sign-up">
                            {snippet('sign-up.button', 'log-in-form')}
                        </Link>
                    </Form.Group>
                </>
            )}
        </Form>
    );
})(style);

export default ForgotPasswordForm;
