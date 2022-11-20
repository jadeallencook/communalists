import { Navbar, Nav, Container } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Link } from 'react-router-dom';

const Navigation: StyledComponent = styled(({ className }) => {
	return (
		<Navbar bg="dark" variant="dark" className={className}>
			<Container>
				<Navbar.Brand>
					<Link to="/">Communalists</Link>
				</Navbar.Brand>
				<Nav className="justify-content-end">
					<Link to="/listings">Listings</Link>
					<Link to="/dashboard/listings">Dashboard</Link>
					<Link to="/sign-in">Sign In</Link>
				</Nav>
			</Container>
		</Navbar>
	);
})(style);

export default Navigation;
