import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Formik } from 'formik';
import initialValues from './initial-values';
import validate from './validate';
import Loading from '../../molecules/Loading';
import { AccountInterface } from '../../../../interfaces/account';
import {
	PRIMARY_OR_THIRD_PERSON_PRONOUNS,
	SECONDARY_OR_POSSESSIVE_PRONOUNS,
} from '../../../../objects/pronouns';

const handler = (values, { setSubmitting }) => {
	setSubmitting(true);
	console.log(values);
};

const CreateAccountForm: StyledComponent = styled(({ className }) => (
	<Formik
		initialValues={initialValues}
		onSubmit={handler}
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
			values: AccountInterface;
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
						<Form.Label>Primary or Third Person Pronoun</Form.Label>
						<Form.Select
							aria-label="Select pronouns"
							name="PrimaryOrThirdPersonPronoun"
							value={values.PrimaryOrThirdPersonPronoun}
							onChange={handleChange}
						>
							{PRIMARY_OR_THIRD_PERSON_PRONOUNS.map((string) => (
								<option key={string} value={string}>
									{string}
								</option>
							))}
						</Form.Select>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Secondary or Possessive Pronoun</Form.Label>
						<Form.Select
							aria-label="Select pronouns"
							name="SecondayOrPossessivePronoun"
							value={values.SecondayOrPossessivePronoun}
							onChange={handleChange}
						>
							{SECONDARY_OR_POSSESSIVE_PRONOUNS.map((string) => (
								<option key={string} value={string}>
									{string}
								</option>
							))}
						</Form.Select>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Country</Form.Label>
						<Form.Select
							aria-label="Default select example"
							name="country"
							value={values.country}
							onChange={handleChange}
						>
							<option value="US">US</option>
						</Form.Select>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Zipcode</Form.Label>
						<Form.Control
							type="text"
							name="zipcode"
							placeholder="Zipcode"
							value={values.zipcode}
							onChange={handleChange}
						/>
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
					<Button
						variant="dark"
						type="submit"
						disabled={isSubmitting}
					>
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
