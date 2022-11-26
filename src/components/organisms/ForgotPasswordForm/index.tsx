import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Formik, ErrorMessage } from 'formik';
import validationSchema from './validate'

const ForgotPasswordForm: StyledComponent = styled(({ className }) => {

    const renderError = (message: string) => <p className="help is-danger">{message}</p>;

    return (
        <Formik
			initialValues={{}}
			onSubmit={() => null}
			validationSchema={validationSchema}
			validateOnChange={false}
			validateOnBlur={false}
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
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="text"
								name="email"
								placeholder="Email"
								value={values.name}
								onChange={handleChange}
							/>
                            <ErrorMessage name="email" render={renderError} />
						</Form.Group>
						<Button type="submit" disabled={isSubmitting}>
							Send Recovery Link
						</Button>
					</Form>
				) : (
					<p>Signing in...</p>
				)
			}
		</Formik>
    )
})(style);

export default ForgotPasswordForm