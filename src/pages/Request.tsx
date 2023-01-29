import { Container } from 'react-bootstrap';
import Form from '@organisms/Form';
import * as yup from 'yup';
import { FormDataInterface } from '@organisms/Form';
import { OBJECT_PRONOUNS, SUBJECT_PRONOUNS } from '@objects/pronouns';
import RequestAidInterface from '@interfaces/request-aid';

const formData: Array<FormDataInterface> = [
	{
		name: 'name',
		initialValue: '',
		type: 'text',
		validationSchema: yup.string().label('Name').required(),
		label: 'Name',
	},
	{
		name: 'subjectPronoun',
		initialValue: 'they',
		type: 'select',
		options: SUBJECT_PRONOUNS,
		validationSchema: yup.string().label('Subject Pronoun').required(),
		label: 'Subject Pronoun',
		size: 'xsm',
	},
	{
		name: 'objectPronoun',
		initialValue: 'them',
		type: 'select',
		options: OBJECT_PRONOUNS,
		validationSchema: yup.string().label('Object Pronoun').required(),
		label: 'Object Pronoun',
		size: 'xsm',
	},
	{
		name: 'language',
		initialValue: 'English',
		type: 'select',
		options: ['English', 'Spanish', 'Vietnamese'],
		validationSchema: yup.string().label('Language').required(),
		label: 'Language',
		size: 'sm',
	},
	{
		name: 'phone',
		initialValue: '',
		type: 'text',
		validationSchema: yup.string().label('Phone').required(),
		label: 'Phone Number',
	},
	{
		name: 'email',
		initialValue: '',
		type: 'text',
		validationSchema: yup.string().label('Email').required(),
		label: 'Email Address',
	},
	{
		name: 'preferredContactMethod',
		initialValue: 'Email',
		type: 'select',
		options: ['Email', 'Call', 'Text'],
		validationSchema: yup.string().label('Email').required(),
		label: 'Preferred Contact Method',
		size: 'xsm',
	},
	{
		name: 'location',
		initialValue: '',
		type: 'text',
		validationSchema: yup.string().label('Location').required(),
		label: 'Location',
	},
	{
		name: 'hasHearingDisability',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup
			.string()
			.label('Has Hearing Disability')
			.required(),
		label: 'Has Hearing Disability',
	},
	{
		name: 'hasTransportation',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup.string().label('Has Transportation').required(),
		label: 'Has Transportation',
	},
	{
		name: 'hasFluLikeSymptoms',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup
			.string()
			.label('Has Flu Like Symptoms')
			.required(),
		label: 'Has Flu Like Symptoms',
	},
	{
		name: 'hasHealthCondition',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup.string().label('Has Health Condition').required(),
		label: 'Has Health Condition',
	},
	{
		name: 'healthConditions',
		initialValue: '',
		type: 'text',
		validationSchema: yup.string().label('Health Conditions').required(),
		label: 'Health Conditions',
	},
	{
		name: 'is18',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup.string().label('Is 18+').required(),
		label: 'Is 18+',
	},
	{
		name: 'needsPickup',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup.string().label('Needs Pickup').required(),
		label: 'Needs Pickup',
	},
	{
		name: 'needsTransportation',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup.string().label('Needs Transportation').required(),
		label: 'Needs Transportation',
	},
	{
		name: 'needsMedicalSupplies',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup
			.string()
			.label('Needs Medical Supplies')
			.required(),
		label: 'Needs Medical Supplies',
	},
	{
		name: 'needsCleaningSupplies',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup
			.string()
			.label('Needs Cleaning Supplies')
			.required(),
		label: 'Needs Cleaning Supplies',
	},
	{
		name: 'needsHomeCookedMeal',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup
			.string()
			.label('Needs Home Cooked Meal')
			.required(),
		label: 'Needs Home Cooked Meal',
	},
	{
		name: 'needHomeCleaning',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup.string().label('Need Home Cleaning').required(),
		label: 'Need Home Cleaning',
	},
	{
		name: 'needsCompanionship',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup.string().label('Needs Companionship').required(),
		label: 'Needs Companionship',
	},
	{
		name: 'needsSocialServices',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup
			.string()
			.label('Needs Social Services')
			.required(),
		label: 'Needs Social Services',
	},
	{
		name: 'needsPetCare',
		initialValue: false,
		type: 'checkbox',
		validationSchema: yup.string().label('Needs Pet Care').required(),
		label: 'Needs Pet Care',
	},
	{
		name: 'needsOther',
		initialValue: '',
		type: 'text',
		validationSchema: yup.string().label('Needs Other').required(),
		label: 'Needs Other',
	},
];

const Request = () => (
	<Container>
		<h1>Request Aid</h1>
		<Form
			data={formData}
			onSubmit={(values: RequestAidInterface) => console.log({ values })}
			submitButtonText="Submit Request"
		/>
	</Container>
);

export default Request;
