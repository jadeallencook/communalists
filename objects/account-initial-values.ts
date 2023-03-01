import AccountInterface from '@interfaces/account';

const accountInitialValues: AccountInterface = {
    name: '',
    location: 'santa-clara-ca',
    organization: 'NONE',
    role: {
        coordinator: false,
        driver: false,
        'social-media': false,
        'tech-support': false,
    },
};

export default accountInitialValues;
