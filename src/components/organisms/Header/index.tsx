import { Container, Row, Col, ButtonGroup, Button } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const Header: StyledComponent = styled(({ className }) => {
	return (
		<Container fluid className={className}>
			<Container>
				<Row>
					<Col>
						<h1>Efficiently Organize Mutual Aid Efforts</h1>
						<p>
							Used by organizations, collectives, volunteers, and
							service providers.
						</p>
						<Button variant="dark">Browse Resources</Button>
						<Button variant="secondary">Create Account</Button>
					</Col>
				</Row>
			</Container>
		</Container>
	);
})(style);

export default Header;
