import { Container } from 'react-bootstrap';
import DashboardNavigation from '@components/DashboardNavigation';
import AidRequestsPage from './Dashboard/AidRequestsPage';
import AccountSettingsPage from './Dashboard/AccountSettingsPage';
import ApplicationsPage from './Dashboard/ApplicationsPage';
import DashboardFooter from '@components/DashboardFooter';
import { DashboardRoutesInterface } from '@interfaces/dashboard-router';
import { useParams } from 'react-router-dom';

const routes: DashboardRoutesInterface = {
    'aid-requests': {
        text: 'Aid Requests',
        component: <AidRequestsPage />,
    },
    'volunteer-requests': {
        text: 'Volunteer Applications',
        component: <ApplicationsPage />,
    },
    'account-settings': {
        text: 'Account Settings',
        component: <AccountSettingsPage />,
    },
};

const DashboardPage = () => {
    let { route = 'aid-requests' } = useParams();
    return (
        <Container>
            <DashboardNavigation routes={routes} route={route} />
            {routes[route].component}
            <DashboardFooter />
        </Container>
    );
};

export default DashboardPage;
