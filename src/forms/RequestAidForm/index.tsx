import { useFormik } from 'formik';
import {
    Button,
    Container,
    Form,
    OverlayTrigger,
    Spinner,
    Tooltip,
} from 'react-bootstrap';
import RequestAidInterface from '@interfaces/request-aid';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import locations from '@objects/locations';
import languages from '@objects/languages';
import methods from '@objects/methods';
import addRequest from '@api/add-request';
import { useContext, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import InfoSVG from '@assets/info.svg';
import SnippetContext from '../../contexts/SnippetContext';

const RequestAidForm: StyledComponent = styled(({ className }) => {
    const [success, setSuccess] = useState(false);
    const { snippet, language: defaultLanguage } = useContext(SnippetContext);
    const {
        handleChange,
        handleSubmit,
        isSubmitting,
        values: {
            name,
            email,
            location,
            phone,
            language,
            method,
            health,
            needs,
        },
    } = useFormik<RequestAidInterface>({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            location: 'san-jose-downtown-ca',
            language: defaultLanguage,
            method: 'email',
            health: '',
            needs: '',
            stage: 'submitted',
            timestamp: Timestamp.fromDate(new Date()),
            driver: '',
        },
        onSubmit: (values) => addRequest(values).then(() => setSuccess(true)),
    });
    return isSubmitting && !success ? (
        <Container className={className}>
            <Spinner animation="border" />
        </Container>
    ) : !isSubmitting && success ? (
        <Container className={className}>
            <h1>Success!</h1>
            <p>
                Our team will review your request and work to match you with
                volunteers who can offer the support you need. The information
                you provide in this form will be kept confidential and used
                solely for the purpose of connecting you with those who can
                help.
                <br />
                <br />
                We are committed to creating a safe and supportive environment
                for everyone in our community. If you have any questions or
                concerns, please don't hesitate to reach out to us. We are here
                to help and make a positive impact in your life. Thank you for
                using this form to request mutual aid.
                <br />
                <br />
                Together, we can make a difference.
                <br />
                <br />
                <a href="mailto: support@communalists.com?subject=Support Request From Communalists">
                    support@communalists.com
                </a>
                <br />
                <small>
                    For web support inquiries, please reach out to our support
                    team using the email above, we are here to assist you!
                    <br />
                    <br />
                    Thank you for choosing to contact us!
                </small>
            </p>
        </Container>
    ) : (
        <Form
            onSubmit={handleSubmit}
            className={`${className} animate__animated animate__fadeIn`}
        >
            <h1>{snippet('header', 'request-aid-form')}</h1>
            <p>{snippet('description', 'request-aid-form')}</p>
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
                    onChange={handleChange}
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
                    {snippet('health.label', 'request-aid-form')}
                </Form.Label>
                <Form.Control
                    id="health"
                    name="health"
                    type="text"
                    placeholder={snippet(
                        'health.placeholder',
                        'request-aid-form'
                    )}
                    onChange={handleChange}
                    value={health}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>
                    {snippet('needs.label', 'request-aid-form')}{' '}
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip id="tooltip-top">
                                <div
                                    style={{
                                        textAlign: 'left',
                                        padding: '10px',
                                    }}
                                >
                                    You can request items such as{' '}
                                    <strong>
                                        groceries, personal care items, or
                                        household supplies
                                    </strong>
                                    . Please include an address to a drop off
                                    location if delivery is required.
                                    <br />
                                    <br />
                                    <strong>Example:</strong> I'm in need of
                                    some fresh produce and a mattress, I can
                                    meet at 456 Oak Ave sometime after 5:00PM on
                                    Wednesday.
                                </div>
                            </Tooltip>
                        }
                    >
                        <img src={InfoSVG} style={{ cursor: 'pointer' }} />
                    </OverlayTrigger>
                </Form.Label>
                <Form.Control
                    as="textarea"
                    id="needs"
                    name="needs"
                    type="text"
                    placeholder={snippet(
                        'needs.placeholder',
                        'request-aid-form'
                    )}
                    onChange={handleChange}
                    value={needs}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Button type="submit">
                    {snippet('submit.button', 'request-aid-form')}
                </Button>
            </Form.Group>
        </Form>
    );
})(style);

export default RequestAidForm;
