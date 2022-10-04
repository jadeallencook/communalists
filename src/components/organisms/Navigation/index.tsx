import { Navbar, Nav, Container } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const Navigation: StyledComponent = styled(({ className }) => {
	return (
		<Navbar bg="dark" variant="dark" className={className}>
			<Container>
				<Navbar.Brand href="#home">Communalists</Navbar.Brand>
				<Nav className="justify-content-end">
					<Nav.Link href="#home">Resources</Nav.Link>
					<Nav.Link href="#features">Directory</Nav.Link>
					<Nav.Link href="#events">Events</Nav.Link>
					<Nav.Link href="#blog">Blog</Nav.Link>
					<Nav.Link href="#account">Account</Nav.Link>
				</Nav>
			</Container>
		</Navbar>
	);
})(style);

export default Navigation;
