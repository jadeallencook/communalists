import * as yup from 'yup';

const validationSchema = yup.object().shape({
    item: yup.string().label("Item").required(),
    description: yup.string().label("Description").required(),
    stock: yup.number().label("Stock").min(1).required(),
    // attribute shape is not known but required for now
    attributes: yup.array().label("Attributes").required(),
    location: yup.string().label("Location").required()
})

export default validationSchema