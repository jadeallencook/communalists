import { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { ErrorMessage, Formik } from 'formik';
import initialValues from './initial-values';
import validationSchema from './validate';
import Loading from '@molecules/Loading';
import { SocketAddress } from 'net';

// States should eventually be pulled from a database
const locations = {
    "CA": {
        "santa-clara-ca": "Santa Clara",
        "alameda-ca": "Alameda"
    },
    "WA": {
        "king-wa": "King"
    }
}

const CreateGroupForm: StyledComponent = styled(({ className }) => {
    const [stateKey, setStateKey] = useState("CA")
    const handleStateChange = (event) => {
		const key = event.target.value;
		setStateKey(key);
	};
    
    const renderError = (message: string) => <p className="help is-danger">{message}</p>;

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={() => null}
            validationSchema={validationSchema}
            validateOnChange={false}
            validateOnBlur={true}
        >
            {({
                values,
                handleChange,
                handleSubmit,
                isSubmitting,
            }: {
                values: any;
                handleChange: any;
                handleSubmit: any;
                isSubmitting: any;
            }) =>
                !isSubmitting ? (
                    <Form className={className} onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Group Name*</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Display Name"
                                value={values.name}
                                onChange={handleChange}
                            />
                            <ErrorMessage name="name" render={renderError} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Bio*</Form.Label>
                            <Form.Control
                                type="text"
                                name="bio"
                                placeholder="Group Bio"
                                value={values.bio}
                                onChange={handleChange}
                            />
                            <ErrorMessage name="bio" render={renderError} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Website</Form.Label>
                            <Form.Control
                                type="text"
                                name="website"
                                placeholder="https://communalists.com"
                                value={values.website}
                                onChange={handleChange}
                            />
                            <ErrorMessage name="website" render={renderError} />
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phone"
                                        placeholder="+19999999999"
                                        value={values.phone}
                                        onChange={handleChange}
                                    />
                                    <ErrorMessage name="phone" render={renderError} />
                                </Form.Group>
                            </Col>
                            <Col>
                            <Form.Group className="mb-3">
                                    <Form.Label>Email*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="email"
                                        placeholder="contact@communalists.com"
                                        value={values.email}
                                        onChange={handleChange}
                                    />
                                    <ErrorMessage name="email" render={renderError} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Label>Address</Form.Label>
                        <Form.Group className="mb-3">
                            <Form.Label>Street*</Form.Label>
                            <Form.Control
                                type="text"
                                name="address.street"
                                placeholder=""
                                value={values.address.street}
                                onChange={handleChange}
                            />
                            <ErrorMessage name="address.street" render={renderError} />
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>City*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address.city"
                                        placeholder=""
                                        value={values.address.city}
                                        onChange={handleChange}
                                    />
                                    <ErrorMessage name="address.city" render={renderError} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>State*</Form.Label>
                                    <Form.Select
                                        className="form-control"
                                        onChange={handleStateChange}
                                        name="address.state"
                                        // value={itemKey}
                                    >
                                        {Object.keys(locations).map(state => (
                                            <option key={state} value={state}>
                                                {state}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <ErrorMessage name="address.state" render={renderError} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Zip*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address.zipcode"
                                        placeholder=""
                                        value={values.address.zipcode}
                                        onChange={handleChange}
                                    />
                                    <ErrorMessage name="address.zipcode" render={renderError} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                        <Form.Label>County*</Form.Label>
                                        <Form.Select
                                            className="form-control"
                                            onChange={handleChange}
                                            name="address.state"
                                            value={values.address.county}
                                        >
                                            {Object.entries(locations[stateKey]).map(([key, value]: [string, string]) => (
                                                <option key={key} value={value}>
                                                    {value}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    <ErrorMessage name="address.county" render={renderError} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button type="submit" disabled={isSubmitting}>
                            Create Account
                        </Button>
                    </Form>
                ) : (
                    <Loading />
                )
            }
        </Formik>
)})(style);

export default CreateGroupForm