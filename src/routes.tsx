import { ReactNode } from 'react';

import RequestAid from '@pages/RequestAid';
import Dashboard from '@pages/Dashboard';
import SignIn from '@pages/SignIn';

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
];

export default routes;
