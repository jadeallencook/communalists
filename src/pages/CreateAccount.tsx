import FirebaseContext from '../contexts/firebase.context';
import { Container } from 'react-bootstrap';
import CreateAccountForm from '../components/organisms/CreateAccountForm';

const CreateAccount = () => {
	return (
		<FirebaseContext.Consumer>
			{(firebase) => {
				return (
					<Container>
						<h1>Let's Get Started</h1>
						<CreateAccountForm />
					</Container>
				);
			}}
		</FirebaseContext.Consumer>
	);
};

export default CreateAccount;
