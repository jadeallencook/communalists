import { ReactNode } from 'react';

import RequestAid from '@pages/RequestAid';
import Dashboard from '@pages/Dashboard';
import SignIn from '@pages/SignIn';
import ViewRequest from '@pages/ViewRequest';

interface Route {
    path: string;
    element: ReactNode;
}

const routes: Route[] = [
    {
        path: '/',
        element: <RequestAid />,
    },
    {
        path: '/request-aid',
        element: <RequestAid />,
    },
    {
        path: '/dashboard',
        element: <Dashboard />,
    },
    {
        path: '/sign-in',
        element: <SignIn />,
    },
    {
        path: '/view-request/:uid',
        element: <ViewRequest />
    }
];

export default routes;
