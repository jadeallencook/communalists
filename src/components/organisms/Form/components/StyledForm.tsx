import { Formik } from 'formik';
import styled, { StyledComponent } from 'styled-components';
import style from '../style';
import * as yup from 'yup';
import { Button, Form as BSForm } from 'react-bootstrap';
import { InitialValueInterface } from '@interfaces/form';
import Input from './Input';
import Checkbox from './Checkbox';
import Select from './Select';
import FormInputProps from '../interfaces/FormInputProps';

interface StyledFormInterface {
	className: string;
	initialValues: InitialValueInterface;
	validationSchema: yup.AnySchema;
	onSubmit: any;
	inputs: any;
	submitButtonText?: string;
}

const StyledForm = styled(
	({
		className,
		inputs,
		initialValues,
		submitButtonText,
		onSubmit,
		validationSchema,
	}: StyledFormInterface): StyledComponent => (
		<Formik
			className={className}
			initialValues={initialValues}
			onSubmit={onSubmit}
			validationSchema={validationSchema}
			validateOnChange={false}
			validateOnBlur={false}
		>
			{({ values, handleChange, handleSubmit, isSubmitting }) => (
				<>
					<BSForm className={className} onSubmit={handleSubmit}>
						{inputs &&
							inputs.map(
								({
									name,
									type,
									placeholder,
									label,
									options,
									size,
								}) => {
									const props: FormInputProps = {
										name,
										placeholder,
										value: values[name],
										isDisabled: isSubmitting,
										label,
									};
									return (
										<BSForm.Group
											className={`mb-3 ${size || ''}`}
											key={name}
										>
											{type === 'text' && (
												<Input
													{...props}
													handler={handleChange}
												/>
											)}
											{type === 'checkbox' && (
												<Checkbox
													{...props}
													handler={handleChange}
												/>
											)}
											{type === 'select' && (
												<Select
													options={options}
													handler={handleChange}
													{...props}
												/>
											)}
										</BSForm.Group>
									);
								}
							)}
						<Button type="submit" disabled={isSubmitting}>
							{submitButtonText || 'Submit'}
						</Button>
					</BSForm>
				</>
			)}
		</Formik>
	)
)(style);

export default StyledForm;
