import { useFormik } from 'formik';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { useContext, useState } from 'react';
import SnippetContext from '../../contexts/SnippetContext';
import locations from '@objects/locations';
import addAccount from '@api/add-account';
import authSignUp from '@api/auth-sign-up';
import Loading from '@components/Loading';
import accountInitialValues from '@objects/account-initial-values';
import SignUpInterface from '@interfaces/sign-up';
import { useNavigate } from 'react-router-dom';

const SignUpForm: StyledComponent = styled(({ className }) => {
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const { snippet } = useContext(SnippetContext);
    const {
        handleChange,
        handleSubmit,
        isSubmitting,
        values: { name, email, location, password, confirmedPassword },
    } = useFormik<SignUpInterface>({
        initialValues: {
            ...accountInitialValues,
            email: '',
            password: '',
            confirmedPassword: '',
            name: '',
        },
        onSubmit: async (values: SignUpInterface) => {
            const { password, confirmedPassword, email, ...rest } = values;
            if (password === confirmedPassword) {
                try {
                    const response = await authSignUp(email, password);
                    if (response?.message) {
                        throw response.message;
                    } else {
                        await addAccount(rest);
                        navigate('/dashboard');
                    }
                } catch (error) {
                    setError(error);
                }
            } else {
                setError(
                    'The passwords you entered do not match. Please try again.'
                );
            }
        },
    });
    return isSubmitting ? (
        <Loading />
    ) : (
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
                {error && <Alert variant="danger">{error}</Alert>}
                <Button type="submit">
                    {snippet('button', 'sign-up-form')}
                </Button>
            </Form.Group>
        </Form>
    );
})(style);

export default SignUpForm;
