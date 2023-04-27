import { useFormik } from 'formik';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { useContext, useState } from 'react';
import SnippetContext from '../../contexts/SnippetContext';
import locations from '@objects/locations';
import addAccount from '@api/add-account';
import roles from '@objects/roles';
import AccountInterface from '@interfaces/account';
import authSignUp from '@api/auth-sign-up';
import Loading from '@components/Loading';
import accountInitialValues from '@objects/account-initial-values';

interface SignUpFormInterface extends AccountInterface {
    password: string;
    confirmedPassword: string;
    email: string;
}

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
            email,
            location,
            bio,
            role,
            password,
            confirmedPassword,
        },
    } = useFormik<SignUpFormInterface>({
        initialValues: {
            ...accountInitialValues,
            email: '',
            password: '',
            confirmedPassword: '',
        },
        onSubmit: async (values: SignUpFormInterface) => {
            const { password, confirmedPassword, email, ...rest } = values;
            if (password === confirmedPassword) {
                try {
                    const response = await authSignUp(email, password);
                    if (response?.message) {
                        throw response.message;
                    } else {
                        await addAccount(rest);
                        setSuccess(true);
                    }
                } catch (error) {
                    setSuccess(false);
                    setError(error);
                }
            } else {
                setSuccess(false);
                setError(
                    'The passwords you entered do not match. Please try again.'
                );
            }
        },
    });
    return isSubmitting ? (
        <Loading />
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
                <Form.Label>{snippet('bio.label', 'sign-up-form')}</Form.Label>
                <Form.Control
                    as="textarea"
                    id="bio"
                    name="bio"
                    type="text"
                    placeholder={snippet('bio.placeholder', 'sign-up-form')}
                    onChange={handleChange}
                    value={bio}
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
