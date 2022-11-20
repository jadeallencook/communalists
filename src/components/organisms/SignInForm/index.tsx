import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Formik } from 'formik';

const SignInForm: StyledComponent = styled(({ className }) => {
	return (
		<Formik
			initialValues={{}}
			onSubmit={() => null}
			validate={() => null}
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
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="text"
								name="email"
								placeholder="Email"
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
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								name="password"
								placeholder="Password"
								value={values.name}
								onChange={handleChange}
							/>
							{errors.name && (
								<Form.Text className="text-error">
									{errors.name as string}
								</Form.Text>
							)}
						</Form.Group>
						<Button type="submit" disabled={isSubmitting}>
							Sign In
						</Button>
						<Button variant="secondary">Create Account</Button>
						<Link to="/forgot-password">Forgot Password</Link>
					</Form>
				) : (
					<p>Signing in...</p>
				)
			}
		</Formik>
	);
})(style);

export default SignInForm;
