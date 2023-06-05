import AccountInterface from './account';

interface SignUpInterface extends AccountInterface {
    password: string;
    confirmedPassword: string;
    email: string;
    name: string;
}

export default SignUpInterface;
