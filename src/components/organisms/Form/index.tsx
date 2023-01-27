import { Formik } from 'formik';
import styled, { StyledComponent } from 'styled-components';
import { HTMLInputTypeAttribute } from 'react';
import style from './style';
import * as yup from 'yup';
import { Button, Form as BSForm } from 'react-bootstrap';

export interface InputInterface {
	type: HTMLInputTypeAttribute;
	name: string;
	label: string;
	options?: Array<string>;
	placeholder?: string;
	size?: 'xsm' | 'sm';
}

export interface FormDataInterface extends InputInterface {
	initialValue: string | boolean;
	validationSchema: yup.AnySchema;
}

export interface FormPropsInterface {
	data: Array<FormDataInterface>;
	onSubmit: any;
	submitButtonText?: string;
}

export interface InitialValueInterface {
	[key: string]: string | number;
}

export interface StyledFormInterface {
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
								}) => (
									<BSForm.Group
										className={`mb-3 ${size}`}
										key={name}
									>
										{type === 'text' && (
											<>
												<BSForm.Label>
													{label}
												</BSForm.Label>
												<BSForm.Control
													type={type}
													name={name}
													placeholder={placeholder}
													onChange={handleChange}
													value={values[name]}
												/>
											</>
										)}
										{type === 'checkbox' && (
											<BSForm.Check
												type={type}
												name={name}
												placeholder={placeholder}
												onChange={handleChange}
												value={values[name]}
												label={label}
											/>
										)}
										{type === 'select' && (
											<>
												<BSForm.Label>
													{label}
												</BSForm.Label>
												<BSForm.Select
													name={name}
													placeholder={placeholder}
													onChange={handleChange}
													value={values[name]}
												>
													{options.map((option) => (
														<option key={option}>
															{option}
														</option>
													))}
												</BSForm.Select>
											</>
										)}
									</BSForm.Group>
								)
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

const Form = ({ onSubmit, data, submitButtonText }: FormPropsInterface) => {
	let validationSchema = yup.object().shape({});
	const {
		initialValues,
		inputs,
	}: {
		initialValues: InitialValueInterface;
		inputs: Array<InputInterface>;
	} = data.reduce(
		(
			{ initialValues, inputs },
			{
				name,
				type,
				size,
				placeholder,
				initialValue,
				label,
				options,
				validationSchema: validation,
			}
		) => ({
			initialValues: { ...initialValues, [name]: initialValue },
			inputs: [
				...inputs,
				{ type, name, placeholder, label, options, size },
			],
		}),
		{ initialValues: {}, inputs: [] }
	);
	return (
		<StyledForm
			onSubmit={onSubmit}
			initialValues={initialValues}
			inputs={inputs}
			submitButtonText={submitButtonText}
		/>
	);
};

export default Form;
