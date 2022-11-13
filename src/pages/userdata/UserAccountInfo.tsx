import { Container, Row, Col, Image } from 'react-bootstrap';

const DisplayUserInfo = (user) => (
	<Container className="bg-secondary shadow-1-strong rounded-2">
        <Row>
            <h1>Account Information</h1>
        </Row>
        <Row>
            <Col lg="2">
                <Image src="https://c4.wallpaperflare.com/wallpaper/392/1018/527/flcl-red-background-cat-animals-wallpaper-preview.jpg" rounded fluid height="auto"></Image>
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
	</Container>
);

export default DisplayUserInfo;