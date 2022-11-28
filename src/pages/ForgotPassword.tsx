import ForgotPasswordForm from '@organisms/ForgotPasswordForm';
import { Container } from 'react-bootstrap';

const ForgotPassword = () => {
	return (
		<Container>
			<h1>Forgot Password</h1>
			<ForgotPasswordForm />
		</Container>
	);
};

export default ForgotPassword;
