import FirebaseContext from '../contexts/firebase.context';
import { Container } from 'react-bootstrap';

const Resources = () => {
	return (
		<FirebaseContext.Consumer>
			{(firebase) => {
				return (
					<Container>
						<h1>Resources</h1>
					</Container>
				);
			}}
		</FirebaseContext.Consumer>
	);
};

export default Resources;
