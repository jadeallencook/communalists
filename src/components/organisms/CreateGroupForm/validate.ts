import * as yup from 'yup';

const phoneRegExp = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]‌​)\s*)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)([2-9]1[02-9]‌​|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})\s*(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+)\s*)?$/i

const validationSchema = yup.object().shape({
    name: yup.string().required("Name is a required Field"),
    bio: yup.string().required("Bio is a required Field"),
    website: yup.string().url(),
    phone: yup.string().matches(phoneRegExp, 'Please enter a valid phone number including country code (+1 for United States)').required("Phone is a required Field"),
    email: yup.string().email().required("Email is a required Field"),
    address: yup.object().shape({
        street: yup.string().required("Street is a required Field"),
        city: yup.string().required("City is a required Field"),
        state: yup.string().required("State is a required Field"),
        zipcode: yup.number().positive().integer().test(
            'is-valid-zipcode', 
            'Please enter a valid ZIP', 
            (zip: number | null) => zip && zip.toString().length === 5
        ).required(),
        county: yup.string().required("County is a required Field")
    })
});

export default validationSchema