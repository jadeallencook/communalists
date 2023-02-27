import { Container } from 'react-bootstrap';
import DashboardNavigation from '@components/DashboardNavigation';
import AidRequestsPage from './Dashboard/AidRequestsPage';
import AccountSettingsPage from './Dashboard/AccountSettingsPage';
import ApplicationsPage from './Dashboard/ApplicationsPage';
import DashboardFooter from '@components/DashboardFooter';
import { DashboardRoutesInterface } from '@interfaces/dashboard-router';
import { useParams } from 'react-router-dom';

const routes: DashboardRoutesInterface = {
    requests: {
        text: 'Requests',
        component: <AidRequestsPage />,
    },
    applications: {
        text: 'Applications',
        component: <ApplicationsPage />,
    },
    settings: {
        text: 'Settings',
        component: <AccountSettingsPage />,
    },
};

const DashboardPage = () => {
    let { route = 'requests' } = useParams();
    return (
        <Container>
            <DashboardNavigation routes={routes} route={route} />
            {routes[route].component}
            <DashboardFooter />
        </Container>
    );
};

export default DashboardPage;
