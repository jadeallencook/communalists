import FirebaseContext from '../contexts/firebase.context';
import { Container } from 'react-bootstrap';

const Dashboard = () => {
	return (
		<FirebaseContext.Consumer>
			{(firebase) => {
				return (
					<Container>
						<h1>Dashboard</h1>
					</Container>
				);
			}}
		</FirebaseContext.Consumer>
	);
};

export default Dashboard;
