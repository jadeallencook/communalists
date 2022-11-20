import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Formik } from 'formik';
import initialValues from './initial-values';
import validate from './validate';
import Loading from '../../molecules/Loading';

const UserSettingsForm: StyledComponent = styled(({ className }) => (
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
						<Form.Label>Email</Form.Label>
						<Form.Control
							type="email"
							name="name"
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
