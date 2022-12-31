import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { ErrorMessage, Formik } from 'formik';
import RenderError from '@components/atoms/RenderError';
import validationSchema from './validate';
import initialValues from './initial-values';

const SignInForm: StyledComponent = styled(({ className }) => {
	return (
		<Formik
			initialValues={initialValues}
			onSubmit={() => null}
			validationSchema={validationSchema}
			validateOnChange={false}
			validateOnBlur={false}
		>
			{({
				values: { name, password },
				handleChange,
				handleSubmit,
				isSubmitting,
			}: {
				values: any;
				handleChange: React.ChangeEventHandler<any>;
				handleSubmit: React.FormEventHandler<HTMLFormElement>;
				isSubmitting: any;
			}) =>
				!isSubmitting ? (
					<Form className={`${className} standard-form`} onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="text"
								name="email"
								placeholder="Email"
								value={name}
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
