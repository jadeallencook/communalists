import * as yup from 'yup';

// Phone regexp for US phone numbers, should be dynamic eventually?
const phoneRegExp =
	/(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]‌​)\s*)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)([2-9]1[02-9]‌​|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})\s*(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+)\s*)?$/i;

const validationSchema = yup.object().shape({
	name: yup.string().label('Name').required(),
	bio: yup.string().label('Bio').required(),
	website: yup.string().label('Website').url(),
	phone: yup
		.string()
		.label('Phone')
		.matches(
			phoneRegExp,
			'Please enter a valid phone number including country code (+1 for United States)'
		)
		.required(),
	email: yup.string().label('Email').email().required(),
	address: yup.object().shape({
		street: yup.string().label('Street').required(),
		city: yup.string().label('City').required(),
		state: yup.string().label('State').required(),
		zipcode: yup
			.number()
			.positive()
			.integer()
			.test(
				'is-valid-zipcode',
				'Please enter a valid ZIP',
				(zip: number | null) => zip && zip.toString().length === 5
			)
			.required(),
		county: yup.string().label('County').required(),
	}),
});

export default validationSchema;
