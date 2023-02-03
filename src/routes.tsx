import { ReactNode } from 'react';

import Home from '@pages/Home';
import Login from '@pages/Login';
import CreateAccount from '@pages/CreateAccount';
import SignIn from '@pages/SignIn';
import DashboardProfile from '@pages/DashboardProfile';
import DashboardOrders from '@pages/DashboardOrders';
import DashboardSettings from '@pages/DashboardSettings';
import ForgotPassword from '@pages/ForgotPassword';
import Request from '@pages/Request';

interface Route {
	path: string;
	element: ReactNode;
}

const routes: Route[] = [
	{
		path: '/',
		element: <Home />,
	},
	{
		path: '/login',
		element: <Login />,
	},
	{
		path: '/dashboard',
		element: <DashboardOrders />,
	},
	{
		path: '/dashboard/profile',
		element: <DashboardProfile />,
	},
	{
		path: '/dashboard/orders',
		element: <DashboardOrders />,
	},
	{
		path: '/dashboard/settings',
		element: <DashboardSettings />,
	},
	{
		path: '/sign-in',
		element: <SignIn />,
	},
	{
		path: '/create-account',
		element: <CreateAccount />,
	},
	{
		path: '/forgot-password',
		element: <ForgotPassword />,
	},
	{
		path: '/request',
		element: <Request />,
	},
];

export default routes;
