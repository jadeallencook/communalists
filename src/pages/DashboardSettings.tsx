import Dashboard from './Dashboard';
import { Table, Button } from 'react-bootstrap';
import UserSettingsForm from '../components/organisms/UserSettingsForm';

const DashboardSettings = () => {
	return (
		<Dashboard>
			<UserSettingsForm />
		</Dashboard>
	);
};

export default DashboardSettings;
