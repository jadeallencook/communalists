import { ReactNode } from 'react';

import RequestAidPage from '@pages/RequestAidPage';
import DashboardPage from '@pages/DashboardPage';
import SignInPage from '@pages/SignInPage';
import ViewRequestPage from '@pages/ViewRequestPage';
import SignUpPage from '@pages/SignUpPage';
import DonatePage from '@pages/Donate';

interface Route {
    path: string;
    element: ReactNode;
}

const routes: Route[] = [
    {
        path: '/',
        element: <RequestAidPage />,
    },
    {
        path: '/request-aid',
        element: <RequestAidPage />,
    },
    {
        path: '/dashboard',
        element: <DashboardPage />,
    },
    {
        path: '/dashboard/:route',
        element: <DashboardPage />,
    },
    {
        path: '/sign-in',
        element: <SignInPage />,
    },
    {
        path: '/view-request/:uid',
        element: <ViewRequestPage />,
    },
    {
        path: '/sign-up',
        element: <SignUpPage />,
    },
    {
        path: '/donate',
        element: <DonatePage />,
    },
];

export default routes;
