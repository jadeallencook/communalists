import { GroupInterface } from '@interfaces/index';

const initialValues: GroupInterface = {
    name: '',
    bio: '',
    website: '',
    phone: '',
    email: '',
    address: {
        street: '',
        city: '',
        state: 'CA',
        zipcode: '',
        county: 'Santa Clara'
    }
}

export default initialValues