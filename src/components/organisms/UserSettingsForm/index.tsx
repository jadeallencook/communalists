import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { ErrorMessage, Formik } from 'formik';
import initialValues from './initial-values';
import Loading from '@molecules/Loading';
import RenderError from '@components/atoms/RenderError';
import validationSchema from './validate';

const UserSettingsForm: StyledComponent = styled(({ className }) => (
	<Formik
		initialValues={initialValues}
		onSubmit={() => null}
		validationSchema={validationSchema}
		validateOnChange={false}
		validateOnBlur={false}
	>
		{({
			values: { email },
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
				<Form className={className} onSubmit={handleSubmit}>
					<Form.Group className="mb-3">
						<Form.Label>Email</Form.Label>
						<Form.Control
							type="email"
							name="email"
							placeholder="Email"
							value={email}
							onChange={handleChange}
						/>
						<ErrorMessage name="email" render={RenderError} />
					</Form.Group>
					<Button type="submit" disabled={isSubmitting}>
						Save Changes
					</Button>
				</Form>
			) : (
				<Loading />
			)
		}
	</Formik>
))(style);

export default UserSettingsForm;
