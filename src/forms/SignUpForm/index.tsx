import { useFormik } from 'formik';
import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { useContext } from 'react';
import SnippetContext from '../../contexts/SnippetContext';
import Loading from '@components/Loading';
import { INITIAL_ACCOUNT_VALUES } from '@objects/initial-account-values';
import SignUpInterface from '@interfaces/sign-up';
import { signUp } from '@api/auth';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SignUpForm: StyledComponent = styled(({ className }) => {
    const { snippet } = useContext(SnippetContext);
    const navigate = useNavigate();

    const { mutateAsync } = useMutation({
        mutationFn: signUp,
        onSuccess: () => navigate('/dashboard'),
        onError: (e) =>
            void toast.error(e instanceof Error ? e.message : String(e)),
    });

    const {
        handleChange,
        handleSubmit,
        isSubmitting,
        values: { name, email, password, confirmedPassword },
    } = useFormik<SignUpInterface>({
        initialValues: {
            ...INITIAL_ACCOUNT_VALUES,
            email: '',
            password: '',
            confirmedPassword: '',
            name: '',
        },
        onSubmit: (values) => mutateAsync(values),
    });

    return isSubmitting ? (
        <Loading />
    ) : (
        <Form onSubmit={handleSubmit} className={className}>
            <h1>{snippet('header', 'sign-up-form')}</h1>
            <p>{snippet('description', 'sign-up-form')}</p>
            <Form.Group className="mb-3">
                <Form.Label>
                    {snippet('display-name.label', 'sign-up-form')}
                </Form.Label>
                <Form.Control
                    id="name"
                    name="name"
                    type="text"
                    placeholder={snippet(
                        'display-name.placeholder',
                        'sign-up-form'
                    )}
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
                <Form.Label>{snippet('password.label')}</Form.Label>
                <Form.Control
                    id="email"
                    name="password"
                    type="password"
                    placeholder={snippet('password.placeholder')}
                    onChange={handleChange}
                    value={password}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>
                    {snippet('confirmedPassword.label', 'sign-up-form')}
                </Form.Label>
                <Form.Control
                    id="confirmedPassword"
                    name="confirmedPassword"
                    type="password"
                    placeholder={snippet('password.placeholder')}
                    onChange={handleChange}
                    value={confirmedPassword}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Button type="submit">
                    {snippet('button', 'sign-up-form')}
                </Button>
            </Form.Group>
        </Form>
    );
})(style);

export default SignUpForm;
