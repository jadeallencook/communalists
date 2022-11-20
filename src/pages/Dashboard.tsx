import { ReactNode } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardRouter: { title: string; link: string }[] = [
	{ title: 'Orders', link: '/dashboard/orders' },
	{ title: 'Listings', link: '/dashboard/listings' },
	{ title: 'Organizations', link: '/dashboard/organizations' },
	{ title: 'Profile', link: '/dashboard/profile' },
	{ title: 'Settings', link: '/dashboard/settings' },
	{ title: 'Admin', link: '/dashboard/admin' },
];

const Dashboard = ({ children }: { children?: ReactNode }) => {
	const navigate = useNavigate();
	let { pathname } = useLocation();
	if (pathname === '/dashboard') pathname = '/dashboard/orders';
	const handleSelect = (route) => navigate(route);

	return (
		<Container>
			<br />
			<Nav
				variant="pills"
				defaultActiveKey={pathname}
				onSelect={handleSelect}
			>
				{DashboardRouter.map(({ title, link }) => (
					<Nav.Item key={link}>
						<Nav.Link eventKey={link}>{title}</Nav.Link>
					</Nav.Item>
				))}
			</Nav>
			<br />
			{children && Array.isArray(children)
				? [...children]
				: children
				? children
				: null}
		</Container>
	);
};

export default Dashboard;
