import { MethodKeyType, MethodType } from '@custom-types/methods';

export const CONTACT_METHODS: { [key in MethodKeyType]: MethodType } = {
    email: 'Email',
    phone: 'Phone Call',
    text: 'Text',
};
