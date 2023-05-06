import { Container } from 'react-bootstrap';
import DashboardNavigation from '@components/DashboardNavigation';
import AidRequestsPage from './Dashboard/AidRequestsPage';
import AccountSettingsPage from './Dashboard/AccountSettingsPage';
import DashboardFooter from '@components/DashboardFooter';
import { DashboardRoutesInterface } from '@interfaces/dashboard-router';
import { useParams } from 'react-router-dom';
import DonationsPage from './Dashboard/DonationsPage';
import OverviewPage from './Dashboard/OverviewPage';
import Loading from '@components/Loading';
import { useContext, useEffect } from 'react';
import DashboardContext from '../contexts/DashboardContext';
import filterRequests from '@utils/filter-requests';

const routes: DashboardRoutesInterface = {
    overview: {
        text: 'Overview',
        component: <OverviewPage />,
        isRestricted: false,
    },
    requests: {
        text: 'Requests',
        component: <AidRequestsPage />,
        isRestricted: true,
    },
    // donations: {
    //     text: 'Donations',
    //     component: <DonationsPage />,
    //     isRestricted: true,
    // },
    settings: {
        text: 'Settings',
        component: <AccountSettingsPage />,
        isRestricted: false,
    },
};

const DashboardPage = () => {
    let { route = 'overview' } = useParams();
    const {
        isLoading,
        myOrganizations,
        fetchRequests,
        requests,
        requestFilters,
    } = useContext(DashboardContext);
    const isOrganizationMember: boolean = !!myOrganizations?.length;

    useEffect(() => {
        if (
            route === 'requests' &&
            !Object.entries(filterRequests(requests, requestFilters)).length
        ) {
            fetchRequests();
        }
    }, [route]);

    return (
        <Container>
            <DashboardNavigation
                routes={routes}
                route={route}
                isOrganizationMember={isOrganizationMember}
            />
            {routes[route].component}
            <DashboardFooter />
        </Container>
    );
};

export default DashboardPage;
