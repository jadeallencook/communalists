import { useFormik } from 'formik';
import { Button, Container, Form } from 'react-bootstrap';
import RequestAidInterface from '@interfaces/request-aid';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import locations from '@objects/locations';
import languages from '@objects/languages';
import methods from '@objects/methods';
import LoadingImage from '@assets/loading.gif';
import addRequest from '@api/add-request';
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';

const RequestAidForm: StyledComponent = styled(({ className }) => {
    const [success, setSuccess] = useState(false);
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
            location: 'santa-clara-ca',
            language: 'english',
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
            <img src={LoadingImage} />
        </Container>
    ) : !isSubmitting && success ? (
        <Container className={className}>
            <h2>Success!</h2>
            <p>We will reach out to you shortly.</p>
        </Container>
    ) : (
        <Form onSubmit={handleSubmit} className={className}>
            <h1>Request Aid</h1>
            <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                    id="name"
                    name="name"
                    type="text"
                    onChange={handleChange}
                    value={name}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Language</Form.Label>
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
                <Form.Label>Location</Form.Label>
                <Form.Select
                    onChange={handleChange}
                    value={location}
                    name="location"
                    id="location"
                >
                    {Object.entries(locations).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value}, CA
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
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
                <Form.Label>Phone</Form.Label>
                <Form.Control
                    id="phone"
                    name="phone"
                    type="phone"
                    onChange={handleChange}
                    value={phone}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Preferred Contact Method</Form.Label>
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
                <Form.Label>Health Conditions</Form.Label>
                <Form.Control
                    id="health"
                    name="health"
                    type="text"
                    onChange={handleChange}
                    value={health}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Information</Form.Label>
                <Form.Control
                    as="textarea"
                    id="needs"
                    name="needs"
                    type="text"
                    onChange={handleChange}
                    value={needs}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Button type="submit">Submit Request</Button>
            </Form.Group>
        </Form>
    );
})(style);

export default RequestAidForm;
