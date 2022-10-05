import FirebaseContext from '../contexts/firebase.context';
import { Container } from 'react-bootstrap';

const Login = () => {
	return (
		<FirebaseContext.Consumer>
			{(firebase) => {
				return (
					<Container>
						<h1>Login</h1>
					</Container>
				);
			}}
		</FirebaseContext.Consumer>
	);
};

export default Login;
