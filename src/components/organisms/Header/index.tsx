import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Link } from 'react-router-dom';

const Header: StyledComponent = styled(({ className }) => {
	return (
		<>
			<br />
			<Alert variant="warning">
				We are currently in the process of building this site,
				everything you see is mock data.
			</Alert>
			<Container fluid className={className}>
				<Container>
					<Row>
						<Col>
							<h1>Efficiently Organize Mutual Aid Efforts</h1>
							<p>
								Used by organizations, collectives, volunteers,
								and service providers.
							</p>
							<Link to="/listings">
								<Button variant="dark">Browse Listings</Button>
							</Link>
							<Link to="/create-account">
								<Button variant="secondary">
									Create Account
								</Button>
							</Link>
						</Col>
					</Row>
				</Container>
			</Container>
		</>
	);
})(style);

export default Header;
