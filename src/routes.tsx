import { ReactNode } from 'react';

import Home from '@pages/Home';
import Listings from '@pages/Listings';
import Login from '@pages/Login';
import CreateAccount from '@pages/CreateAccount';
import SignIn from '@pages/SignIn';
import DashboardProfile from '@pages/DashboardProfile';
import DashboardListings from '@pages/DashboardListings';
import DashboardGroups from '@pages/DashboardGroups';
import DashboardOrders from '@pages/DashboardOrders';
import DashboardSettings from '@pages/DashboardSettings';
import DashboardAdmin from '@pages/DashboardAdmin';
import ForgotPassword from '@pages/ForgotPassword';

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
		path: '/listings',
		element: <Listings />,
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
		path: '/dashboard/listings',
		element: <DashboardListings />,
	},
	{
		path: '/dashboard/groups',
		element: <DashboardGroups />,
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
		path: '/dashboard/admin',
		element: <DashboardAdmin />,
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
];

export default routes;
