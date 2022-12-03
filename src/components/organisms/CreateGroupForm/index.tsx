import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { ErrorMessage, Formik } from 'formik';
import initialValues from './initial-values';
import validationSchema from './validate';
import Loading from '@molecules/Loading';
import { USStateType } from '@custom-types/us-state';
import locationMap from '@objects/location-map';
import { GroupInterface } from '@interfaces/group';
import renderError from '@components/atoms/RenderError';
import { formOptionMapValueByValues } from '../../../utils/formUtils';

export interface CreateGroupFormInterface {
    isModal: boolean,
    handleClose: Function
}

const CreateGroupForm = ({
    isModal = false,
    handleClose
}: CreateGroupFormInterface) => {

    // TODO: Pull default state from user settings, user?.address?.state
    const [stateKey, setStateKey] = useState<USStateType>('CA')

    const handleStateChange: React.ChangeEventHandler<HTMLSelectElement> = ({ target: { value } }) => {
        setStateKey(value as USStateType);
    };

    const handleSubmit = (values: any) => {
        console.log(values)
        handleClose()
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
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
                values: GroupInterface;
                handleChange: React.ChangeEventHandler<any>;
                handleSubmit: React.FormEventHandler<HTMLFormElement>;
                isSubmitting: boolean;
            }) =>
                !isSubmitting ? (
                    <Form  onSubmit={handleSubmit}>
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
                                placeholder="Street"
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
                                        placeholder="City"
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
                                    >
                                        {Object.keys(locationMap).map(state => (
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
                                    <Form.Label>Zipcode*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address.zipcode"
                                        placeholder="Zipcode"
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
                                        name="address.county"
                                        value={values.address.county}
                                    >
                                        {formOptionMapValueByValues(locationMap[stateKey])}
                                    </Form.Select>
                                    <ErrorMessage name="address.county" render={renderError} />
                                </Form.Group>
                            </Col>
                        </Row>

                        {!isModal && 
                            <Button type="submit" disabled={isSubmitting}>
                                Create Account
                            </Button>}

                        {isModal &&
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => handleClose()}>
                                    Close
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    Create Account
                                </Button>
                            </Modal.Footer>}
                    </Form>
                ) : (
                    <Loading />
                )
            }
        </Formik>
    )
};

export default CreateGroupForm