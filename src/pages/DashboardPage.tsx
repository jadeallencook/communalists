import { Container } from 'react-bootstrap';
import DashboardNavigation from '@components/DashboardNavigation';
import RequestsPage from './Dashboard/RequestsPage';
import AccountSettingsPage from './Dashboard/AccountSettingsPage';
import { DashboardRoutesInterface } from '@interfaces/dashboard-router';
import { useNavigate, useParams } from 'react-router-dom';
import OverviewPage from './Dashboard/OverviewPage';
import { useContext, useEffect } from 'react';
import DashboardContext from '../contexts/DashboardContext';
import filterDocuments from '@utils/filter-documents';
import ActionsPage from './Dashboard/ActionsPage';

const routes: DashboardRoutesInterface = {
    overview: {
        text: 'Overview',
        component: <OverviewPage />,
        isRestricted: false,
    },
    requests: {
        text: 'Requests',
        component: <RequestsPage />,
        isRestricted: true,
    },
    actions: {
        text: 'Actions',
        component: <ActionsPage />,
        isRestricted: true,
    },
    settings: {
        text: 'Settings',
        component: <AccountSettingsPage />,
        isRestricted: false,
    },
};

const DashboardPage = () => {
    // get route from url
    let { route = 'overview' } = useParams();

    // get dashboard data from context
    let {
        myOrganizations,
        fetchRequests,
        fetchActions,
        requests,
        requestFilters,
        actions,
        actionFilters,
    } = useContext(DashboardContext);

    // check if user is a member of any organizations
    const isOrganizationMember: boolean = !!myOrganizations?.length;

    // check if there are any requests or actions
    const hasRequests: boolean = !!Object.entries(
        filterDocuments(requests, requestFilters)
    ).length;
    const hasActions: boolean = !!Object.entries(
        filterDocuments(actions, actionFilters)
    ).length;

    // fetch documents if on route and no documents are present
    useEffect(() => {
        if (route === 'requests' && !hasRequests) {
            fetchRequests();
        } else if (route === 'actions' && !hasActions) {
            fetchActions();
        }
    }, [route]);

    // always redirect the user to overview page on first load
    const navigate = useNavigate();
    useEffect(() => navigate('/dashboard'), []);

    return (
        <Container>
            <DashboardNavigation
                routes={routes}
                route={route}
                isOrganizationMember={isOrganizationMember}
            />
            {routes[route].component}
        </Container>
    );
};

export default DashboardPage;
