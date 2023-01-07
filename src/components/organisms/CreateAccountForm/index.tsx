import { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { ErrorMessage, Formik } from 'formik';
import initialValues from './initial-values';
import validationSchema from './validate';
import Loading from '@molecules/Loading';
import { SUBJECT_PRONOUNS, OBJECT_PRONOUNS } from '@objects/pronouns';
import RenderError from '@components/atoms/RenderError';
import { UserInterface } from '@interfaces/user';
import { getLocationKeysAndValuesByState } from '@utils/formUtils';
import { USStateType } from '@custom-types/us-state';
import locationMap from '@objects/location-map';

// Temp interface for values obj, Both this and UserInterface need to be reviewed
interface createAccountInterface extends UserInterface {
	email: string;
	password: string;
	passwordConfirmation: string;
}

const CreateAccountForm: StyledComponent = styled(({ className }) => {
	const [stateKey, setStateKey] = useState<USStateType>('CA');

	const handleStateChange: React.ChangeEventHandler<HTMLSelectElement> = ({
		target: { value },
	}) => {
		setStateKey(value as USStateType);
	};

	return (
		<Formik
			initialValues={initialValues}
			onSubmit={() => null}
			validationSchema={validationSchema}
			validateOnChange={false}
			validateOnBlur={false}
		>
			{({
				values: {
					name,
					email,
					password,
					passwordConfirmation,
					subjectPronoun,
					objectPronoun,
					address: { street, city, zipcode, county },
					isRemote,
				},
				handleChange,
				handleSubmit,
				isSubmitting,
			}: {
				values: createAccountInterface;
				handleChange: React.ChangeEventHandler<any>;
				handleSubmit: React.FormEventHandler<HTMLFormElement>;
				isSubmitting: boolean;
			}) =>
				!isSubmitting ? (
					<Form
						className={`${className} standard-form`}
						onSubmit={handleSubmit}
					>
						<Form.Group className="mb-3">
							<Form.Label>Display Name</Form.Label>
							<Form.Control
								type="text"
								name="name"
								placeholder="Display Name"
								value={name}
								onChange={handleChange}
							/>
							<ErrorMessage name="name" render={RenderError} />
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Email address</Form.Label>
							<Form.Control
								type="email"
								name="email"
								placeholder="Enter email"
								value={email}
								onChange={handleChange}
							/>
							<ErrorMessage name="email" render={RenderError} />
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								name="password"
								placeholder="Password"
								value={password}
								onChange={handleChange}
							/>
							<ErrorMessage
								name="password"
								render={RenderError}
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Confirm Password</Form.Label>
							<Form.Control
								type="password"
								name="passwordConfirmation"
								placeholder="Confirm Password"
								value={passwordConfirmation}
								onChange={handleChange}
							/>
							<ErrorMessage
								name="passwordConfirmation"
								render={RenderError}
							/>
						</Form.Group>
						<Row>
							<Col>
								<Form.Group className="mb-3">
									<Form.Label>Subject Pronoun</Form.Label>
									<Form.Select
										aria-label="Select pronouns"
										className="select-sm"
										name="subjectPronoun"
										value={subjectPronoun}
										onChange={handleChange}
									>
										{SUBJECT_PRONOUNS.map((string) => (
											<option key={string} value={string}>
												{string}
											</option>
										))}
									</Form.Select>
									<ErrorMessage
										name="subjectPronoun"
										render={RenderError}
									/>
								</Form.Group>
							</Col>
							<Col>
								<Form.Group className="mb-3">
									<Form.Label>Object Pronoun</Form.Label>
									<Form.Select
										aria-label="Select pronouns"
										className="select-sm"
										name="objectPronoun"
										value={objectPronoun}
										onChange={handleChange}
									>
										{OBJECT_PRONOUNS.map((string) => (
											<option key={string} value={string}>
												{string}
											</option>
										))}
									</Form.Select>
									<ErrorMessage
										name="objectPronoun"
										render={RenderError}
									/>
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
								value={street}
								onChange={handleChange}
							/>
							<ErrorMessage
								name="address.street"
								render={RenderError}
							/>
						</Form.Group>
						<Row>
							<Col>
								<Form.Group className="mb-3">
									<Form.Label>City*</Form.Label>
									<Form.Control
										className="input-sm"
										type="text"
										name="address.city"
										placeholder="City"
										value={city}
										onChange={handleChange}
									/>
									<ErrorMessage
										name="address.city"
										render={RenderError}
									/>
								</Form.Group>
							</Col>
							<Col>
								<Form.Group className="mb-3">
									<Form.Label>State*</Form.Label>
									<Form.Select
										className="select-sm"
										onChange={handleStateChange}
										name="address.state"
									>
										{Object.keys(locationMap).map(
											(state) => (
												<option
													key={state}
													value={state}
												>
													{state}
												</option>
											)
										)}
									</Form.Select>
									<ErrorMessage
										name="address.state"
										render={RenderError}
									/>
								</Form.Group>
							</Col>
						</Row>
						<Row>
							<Col>
								<Form.Group className="mb-3">
									<Form.Label>Zipcode*</Form.Label>
									<Form.Control
										className="input-sm"
										type="text"
										name="address.zipcode"
										placeholder="Zipcode"
										value={zipcode}
										onChange={handleChange}
									/>
									<ErrorMessage
										name="address.zipcode"
										render={RenderError}
									/>
								</Form.Group>
							</Col>
							<Col>
								<Form.Group className="mb-3">
									<Form.Label>County*</Form.Label>
									<Form.Select
										className="select-sm"
										onChange={handleChange}
										name="address.county"
										value={county}
									>
										{getLocationKeysAndValuesByState(
											stateKey
										).map((option) => (
											<option
												key={option.key}
												value={option.value}
											>
												{option.value}
											</option>
										))}
									</Form.Select>
									<ErrorMessage
										name="address.county"
										render={RenderError}
									/>
								</Form.Group>
							</Col>
						</Row>
						<Form.Group
							className="mb-3"
							controlId="formBasicCheckbox"
						>
							<Form.Check
								type="checkbox"
								label="Check this box if you're able to work remotely"
								name="isRemote"
								checked={isRemote}
								onChange={handleChange}
							/>
							<ErrorMessage
								name="isRemote"
								render={RenderError}
							/>
						</Form.Group>
						<Button type="submit" disabled={isSubmitting}>
							Create Account
						</Button>
					</Form>
				) : (
					<Loading />
				)
			}
		</Formik>
	);
})(style);

export default CreateAccountForm;
