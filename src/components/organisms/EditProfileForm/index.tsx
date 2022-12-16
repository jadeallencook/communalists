import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { ErrorMessage, Formik } from 'formik';
import initialValues from './initial-values';
import Loading from '../../molecules/Loading';
import { SUBJECT_PRONOUNS, OBJECT_PRONOUNS } from '@objects/pronouns';
import { database } from '@database/index';
import { UserInterface } from '@interfaces/user';
import RenderError from '@components/atoms/RenderError';
import validationSchema from './validate';
const user = database.users['janedoe'];

const EditProfileForm: StyledComponent = styled(({ className }) => (
	<Formik
		initialValues={{ ...initialValues, ...user }}
		onSubmit={() => null}
		validationSchema={validationSchema}
		validateOnChange={false}
		validateOnBlur={false}
	>
		{({
			values: {name, subjectPronoun, objectPronoun, isRemote},
			handleChange,
			handleSubmit,
			isSubmitting,
		}: {
			values: UserInterface;
			handleChange: React.ChangeEventHandler<any>;
			handleSubmit: React.FormEventHandler<HTMLFormElement>;
			isSubmitting: any;
		}) =>
			!isSubmitting ? (
				<Form className={`${className} standard-form`} onSubmit={handleSubmit}>
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
						<Form.Select className="select-sm">
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
						Save Changes
					</Button>
				</Form>
			) : (
				<Loading />
			)
		}
	</Formik>
))(style);

export default EditProfileForm;
