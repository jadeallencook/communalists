import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Formik, ErrorMessage } from 'formik';
import validationSchema from './validate';
import RenderError from '@components/atoms/RenderError';
import initialValues from './initial-values';

const ForgotPasswordForm: StyledComponent = styled(({ className }) => {

	return (
		<Formik
			initialValues={initialValues}
			onSubmit={() => null}
			validationSchema={validationSchema}
			validateOnChange={false}
			validateOnBlur={false}
		>
			{({
				values: { name },
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
						<Button type="submit" disabled={isSubmitting}>
							Send Recovery Link
						</Button>
						<Link to="/forgot-password">Back To Sign In</Link>
					</Form>
				) : (
					<p>Signing in...</p>
				)
			}
		</Formik>
	);
})(style);

export default ForgotPasswordForm;
