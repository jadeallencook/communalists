import { ReactNode } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardRouter: { title: string; link: string }[] = [
	{ title: 'Orders', link: '/dashboard/orders' },
	{ title: 'Listings', link: '/dashboard/listings' },
	{ title: 'Organizations', link: '/dashboard/organizations' },
	{ title: 'Profile', link: '/dashboard/profile' },
];

const Dashboard = ({
	children,
	title = 'Dashboard',
}: {
	children?: ReactNode;
	title?: string;
}) => {
	const navigate = useNavigate();
	let { pathname } = useLocation();
	if (pathname === '/dashboard') pathname = '/dashboard/orders';
	const handleSelect = (route) => navigate(route);

	return (
		<Container>
			<h1>{title}</h1>
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
