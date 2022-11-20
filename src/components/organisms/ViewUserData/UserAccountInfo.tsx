import { Container, Row, Col, Image, ListGroup } from 'react-bootstrap';
import { UserInterface } from '../../../../interfaces/user';
import defaultImage from './defaultUserPfp.jpg'

const DisplayUserInfo = (user : UserInterface) => (
	<Container className="bg-secondary shadow-1-strong rounded-2">
        <Row>
            <h1>Account Information</h1>
        </Row>
        <Row>
            <Col lg="2">
                <Image src={defaultImage} rounded fluid height="auto"></Image>
            </Col>
            <Col>
                <Row>
                    <h2>Name: {user.name}</h2>
                </Row>
                <Row>
                    <h3>Pronouns: {user.subjectPronoun}</h3>
                </Row>
            </Col>
        </Row>    
        <Row>
            <h1>Organization Quick Access</h1>
            <ListGroup>
            </ListGroup>
        </Row>
	</Container>
);

export default DisplayUserInfo;