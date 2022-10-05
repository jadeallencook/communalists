import FirebaseContext from '../contexts/firebase.context';
import { Container } from 'react-bootstrap';

const CreateAccount = () => {
	return (
		<FirebaseContext.Consumer>
			{(firebase) => {
				return (
					<Container>
						<h1>Create Account</h1>
					</Container>
				);
			}}
		</FirebaseContext.Consumer>
	);
};

export default CreateAccount;
