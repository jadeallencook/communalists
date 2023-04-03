import { Container, Spinner } from 'react-bootstrap';
import DashboardNavigation from '@components/DashboardNavigation';
import AidRequestsPage from './Dashboard/AidRequestsPage';
import AccountSettingsPage from './Dashboard/AccountSettingsPage';
import ApplicationsPage from './Dashboard/ApplicationsPage';
import DashboardFooter from '@components/DashboardFooter';
import { DashboardRoutesInterface } from '@interfaces/dashboard-router';
import { useParams } from 'react-router-dom';
import NotApprovedPage from './Dashboard/NotApprovedPage';
import { useQuery } from 'react-query';
import getMyAccount from '@api/get-my-account';

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
    const { isLoading, data: account } = useQuery('@account', getMyAccount);

    if (isLoading) {
        return (
            <Container style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container>
            {account?.approved ? (
                <>
                    <DashboardNavigation routes={routes} route={route} />
                    {routes[route].component}
                    <DashboardFooter />
                </>
            ) : (
                <NotApprovedPage />
            )}
        </Container>
    );
};

export default DashboardPage;
