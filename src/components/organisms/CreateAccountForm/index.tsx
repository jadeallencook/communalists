import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import { ErrorMessage, Formik } from 'formik';
import initialValues from './initial-values';
import validationSchema from './validate';
import Loading from '@molecules/Loading';
import { SUBJECT_PRONOUNS, OBJECT_PRONOUNS } from '@objects/pronouns';
import RenderError from '@components/atoms/RenderError';
import { ObjectPronounType, SubjectPronounType } from '@custom-types/pronouns';

// Temp interface for values obj
interface createAccountInterface {
	name: string,
	email: string,
	password: string,
	passwordConfirmation: string,
	subjectPronoun: SubjectPronounType,
	objectPronoun: ObjectPronounType,
	isRemote: boolean
}

const CreateAccountForm = () => {
	return (
		<Formik
			initialValues={initialValues}
			onSubmit={() => null}
			validationSchema={validationSchema}
			validateOnChange={false}
			validateOnBlur={false}
		>
			{({
				values: {name, email, password, passwordConfirmation, subjectPronoun, objectPronoun, isRemote},
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
					<Form className="standard-form" onSubmit={handleSubmit}>
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
							<ErrorMessage name="password" render={RenderError} />
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
							<ErrorMessage name="passwordConfirmation" render={RenderError} />
						</Form.Group>
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
							<ErrorMessage name="subjectPronoun" render={RenderError} />
						</Form.Group>
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
							<ErrorMessage name="objectPronoun" render={RenderError} />
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>County</Form.Label>
							<Form.Select
								className="select-sm"
							>
								<option value="santa-clara-ca">Santa Clara</option>
							</Form.Select>
						</Form.Group>
						<Form.Group className="mb-3" controlId="formBasicCheckbox">
							<Form.Check
								type="checkbox"
								label="Check this box if you're able to work remotely"
								name="isRemote"
								checked={isRemote}
								onChange={handleChange}
							/>
							<ErrorMessage name="isRemote" render={RenderError} />
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
	)
};

export default CreateAccountForm;
