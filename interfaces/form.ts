import * as yup from 'yup';
import { HTMLInputTypeAttribute } from "react";

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