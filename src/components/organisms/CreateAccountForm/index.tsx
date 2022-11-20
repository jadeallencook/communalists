import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Formik } from 'formik';
import initialValues from './initial-values';
import validate from './validate';
import Loading from '../../molecules/Loading';
import {
	SUBJECT_PRONOUNS,
	OBJECT_PRONOUNS,
} from '../../../../objects/pronouns';

const CreateAccountForm: StyledComponent = styled(({ className }) => (
	<Formik
		initialValues={initialValues}
		onSubmit={() => null}
		validate={validate}
		validateOnChange={false}
		validateOnBlur={false}
	>
		{({
			values,
			errors,
			handleChange,
			handleSubmit,
			isSubmitting,
		}: {
			values: any;
			errors: any;
			handleChange: any;
			handleSubmit: any;
			isSubmitting: any;
		}) =>
			!isSubmitting ? (
				<Form className={className} onSubmit={handleSubmit}>
					<Form.Group className="mb-3">
						<Form.Label>Display Name</Form.Label>
						<Form.Control
							type="text"
							name="name"
							placeholder="Display Name"
							value={values.name}
							onChange={handleChange}
						/>
						{errors.name && (
							<Form.Text className="text-error">
								{errors.name as string}
							</Form.Text>
						)}
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Email address</Form.Label>
						<Form.Control
							type="email"
							name="email"
							placeholder="Enter email"
							value={values.email}
							onChange={handleChange}
						/>
						{errors.email && (
							<Form.Text className="text-danger">
								{errors.email as string}
							</Form.Text>
						)}
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Password</Form.Label>
						<Form.Control
							type="password"
							name="password"
							placeholder="Password"
							value={values.password}
							onChange={handleChange}
						/>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Confirm Password</Form.Label>
						<Form.Control
							type="password"
							name="passwordConfirmation"
							placeholder="Confirm Password"
							value={values.passwordConfirmation}
							onChange={handleChange}
						/>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Subject Pronoun</Form.Label>
						<Form.Select
							aria-label="Select pronouns"
							name="subjectPronoun"
							value={values.subjectPronoun}
							onChange={handleChange}
						>
							{SUBJECT_PRONOUNS.map((string) => (
								<option key={string} value={string}>
									{string}
								</option>
							))}
						</Form.Select>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Object Pronoun</Form.Label>
						<Form.Select
							aria-label="Select pronouns"
							name="objectPronoun"
							value={values.objectPronoun}
							onChange={handleChange}
						>
							{OBJECT_PRONOUNS.map((string) => (
								<option key={string} value={string}>
									{string}
								</option>
							))}
						</Form.Select>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>County</Form.Label>
						<Form.Select>
							<option value="santa-clara-ca">Santa Clara</option>
						</Form.Select>
					</Form.Group>
					<Form.Group className="mb-3" controlId="formBasicCheckbox">
						<Form.Check
							type="checkbox"
							label="Check this box if you're able to work remotely"
							name="isRemote"
							checked={values.isRemote}
							onChange={handleChange}
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
))(style);

export default CreateAccountForm;
