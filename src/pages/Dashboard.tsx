import { ReactNode } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardRouter from '@objects/dashboard-router';

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
