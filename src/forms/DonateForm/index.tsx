import { useFormik } from 'formik';
import { Button, Container, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import locations from '@objects/locations';
import languages from '@objects/languages';
import methods from '@objects/methods';
import { useContext, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import SnippetContext from '../../contexts/SnippetContext';
import formatPhoneNumer from '@utils/format-phone-number';
import DonationInterface from '@interfaces/donation';
import addDonation from '@api/add-donation';
import Loading from '@components/Loading';

const DonateForm: StyledComponent = styled(({ className }) => {
    const [success, setSuccess] = useState(false);
    const { snippet, language: defaultLanguage } = useContext(SnippetContext);
    const {
        handleChange,
        handleSubmit,
        isSubmitting,
        setFieldValue,
        values: { name, email, location, phone, language, method, body },
    } = useFormik<DonationInterface>({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            location: 'santa-clara-ca',
            language: defaultLanguage,
            method: 'email',
            body: '',
            hasDriver: false,
            stage: 'submitted',
            timestamp: Timestamp.fromDate(new Date()),
            driver: '',
            coordinator: '',
        },
        onSubmit: (values) => addDonation(values).then(() => setSuccess(true)),
    });

    const phoneHandler = (event) => {
        const formatted = formatPhoneNumer(event);
        setFieldValue('phone', formatted);
    };

    return isSubmitting && !success ? (
        <Loading />
    ) : !isSubmitting && success ? (
        <Container className={className}>
            <h1>{snippet('success.header', 'donate-form')}</h1>
            <p>{snippet('success.description', 'donate-form')}</p>
        </Container>
    ) : (
        <Form
            onSubmit={handleSubmit}
            className={`${className} animate__animated animate__fadeIn`}
        >
            <h1>{snippet('header', 'donate-form')}</h1>
            <p>{snippet('description', 'donate-form')}</p>
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
                <Form.Label>{snippet('language.label')}</Form.Label>
                <Form.Select
                    onChange={handleChange}
                    value={language}
                    name="language"
                    id="language"
                >
                    {Object.entries(languages).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value}
                        </option>
                    ))}
                </Form.Select>
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
                <Form.Label>{snippet('phone.label')}</Form.Label>
                <Form.Control
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={snippet('phone.placeholder')}
                    onChange={handleChange && phoneHandler}
                    value={phone}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>{snippet('method.label')}</Form.Label>
                <Form.Select
                    onChange={handleChange}
                    value={method}
                    name="method"
                    id="method"
                >
                    {Object.entries(methods).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>
                    {snippet('donation.label', 'donate-form')}
                </Form.Label>
                <Form.Control
                    as="textarea"
                    id="donation"
                    name="donation"
                    type="text"
                    placeholder={snippet('donation.placeholder', 'donate-form')}
                    onChange={handleChange}
                    value={body}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Button type="submit">
                    {snippet('submit.button', 'donate-form')}
                </Button>
            </Form.Group>
        </Form>
    );
})(style);

export default DonateForm;
