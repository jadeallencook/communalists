import { Container } from 'react-bootstrap';
import DashboardNavigation from '@components/DashboardNavigation';
import AidRequestsPage from './Dashboard/AidRequestsPage';
import AccountSettingsPage from './Dashboard/AccountSettingsPage';
import VolunteerRequestsPage from './Dashboard/VolunteerRequestsPage';
import DashboardFooter from '@components/DashboardFooter';
import { DashboardRoutesInterface } from '@interfaces/dashboard-router';

const routes: DashboardRoutesInterface = {
    'aid-requests': {
        text: 'Aid Requests',
        component: <AidRequestsPage />,
    },
    'volunteer-requests': {
        text: 'Volunteer Requests',
        component: <VolunteerRequestsPage />,
    },
    'account-settings': {
        text: 'Account Settings',
        component: <AccountSettingsPage />,
    },
};

const DashboardPage = () => {
    return (
        <Container>
            <DashboardNavigation routes={routes} />
            <DashboardFooter />
        </Container>
    );
};

export default DashboardPage;
