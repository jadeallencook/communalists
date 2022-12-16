import { Navbar, Nav, Container } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Link, useLocation } from 'react-router-dom';
import ShoppingCart from '@organisms/ShoppingCart';

const routerLinks = [
	{ title: 'Listings', route: '/listings' },
	{ title: 'Dashboard', route: '/dashboard' },
	{ title: 'Sign In', route: '/sign-in' },
];

const Navigation: StyledComponent = styled(({ className }) => {
	const { pathname } = useLocation();
	return (
		<Navbar bg="dark" variant="dark" className={className}>
			<Container>
				<Navbar.Brand>
					<Link to="/">Communalists</Link>
				</Navbar.Brand>
				<Nav className="justify-content-end">
					{routerLinks.map(({ title, route }) => (
						<Link
							className={
								pathname.indexOf(route) === 0 ? 'active' : ''
							}
							key={route}
							to={route}
						>
							{title}
						</Link>
					))}
					<ShoppingCart />
				</Nav>
			</Container>
		</Navbar>
	);
})(style);

export default Navigation;
