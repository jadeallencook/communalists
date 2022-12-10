// initialValues seems to override this the first time component renders, for now storing basic attributes in initialValues
// initialValues will need to be set after api calls
const initialValues: any  = {
    item: 'bedframe',
    description: '',
    stock: 1,
    attributes: [['size', 'twin']],
    location: '',
}

export default initialValues;