import * as yup from 'yup';

const validationSchema = yup.object({
    email: yup.string().email().required(),
});

export default validationSchema