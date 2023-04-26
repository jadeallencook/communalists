import { Container } from 'react-bootstrap';
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
import DonationsPage from './Dashboard/DonationsPage';
import OverviewPage from './Dashboard/OverviewPage';
import Loading from '@components/Loading';
import ChatPage from './Dashboard/ChatPage';

const routes: DashboardRoutesInterface = {
    overview: {
        text: 'Overview',
        component: <OverviewPage />,
    },
    chat: {
        text: 'Chat',
        component: <ChatPage />,
    },
    requests: {
        text: 'Requests',
        component: <AidRequestsPage />,
    },
    donations: {
        text: 'Donations',
        component: <DonationsPage />,
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
    let { route = 'overview' } = useParams();
    const { isLoading, data: account } = useQuery('@account', getMyAccount);

    if (isLoading) return <Loading />;

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
