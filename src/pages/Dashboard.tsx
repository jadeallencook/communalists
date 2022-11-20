import { Container } from 'react-bootstrap';
import UserAccountInfo from '../components/organisms/ViewUserData/UserAccountInfo';

const Dashboard = () => (
	<Container>
		<h1>Dashboard</h1>
		<UserAccountInfo name={'TestVolunteer'} subjectPronoun={'they'} objectPronoun={'all'} isRemote={false}></UserAccountInfo>
	</Container>
);

export default Dashboard;
