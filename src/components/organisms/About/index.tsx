import { Container, Row, Col, Button } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const About: StyledComponent = styled(({ className }) => {
	return (
		<Container fluid className={className}>
			<Container>
				<Row>
					<Col>
						<h1>What Is Mutual Aid?</h1>
						<p>
							Mutual aid is about cooperating to serve community
							members. Mutual aid creates networks of care and
							generosity to meet the immediate needs of our
							neighbors. It also addresses the root causes of
							challenges we face and demands transformative
							change.
						</p>
					</Col>
				</Row>
			</Container>
		</Container>
	);
})(style);

export default About;
