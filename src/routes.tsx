import { ReactNode } from 'react';

import RequestAidPage from '@pages/RequestAidPage';
import DashboardPage from '@pages/DashboardPage';
import SignInPage from '@pages/SignInPage';
import ViewRequestPage from '@pages/ViewRequestPage';
import SignUpPage from '@pages/SignUpPage';
import DonatePage from '@pages/Donate';
import ForgotPasswordPage from '@pages/ForgotPassword';
import EventsPage from '@pages/EventsPage';
import HomePage from '@pages/HomePage';

interface Route {
    path: string;
    element: ReactNode;
}

const routes: Route[] = [
    {
        path: '/',
        element: <HomePage />,
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
    {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
    },
    {
        path: '/events',
        element: <EventsPage />,
    },
];

export default routes;
