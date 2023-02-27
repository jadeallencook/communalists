import { MethodKeyType, MethodType } from '@custom-types/methods';

const methods: { [key in MethodKeyType]: MethodType } = {
    email: 'Email',
    phone: 'Phone Call',
    text: 'Text',
};

export default methods;
