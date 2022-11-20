import { useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardRouter: { title: string; link: string }[] = [
	{ title: 'Profile', link: '/dashboard/profile' },
	{ title: 'Listings', link: '/dashboard/listings' },
	{ title: 'Organizations', link: '/dashboard/organizations' },
	{ title: 'Orders', link: '/dashboard/orders' },
];

const Dashboard = ({ children = [], title = 'Dashboard' }) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();
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
			{children ? [...children] : null}
		</Container>
	);
};

export default Dashboard;
