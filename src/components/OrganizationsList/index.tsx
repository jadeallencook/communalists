import {
    Accordion,
    Form,
    Badge,
    Button,
    Card,
    Container,
    ListGroup,
    Stack,
    Row,
    Col,
} from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { useContext } from 'react';
import DashboardContext from '../../contexts/DashboardContext';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';

const OrganizationsList: StyledComponent = styled(
    ({ className }: { className: string }) => {
        const { organizations, myOrganizations, uid } =
            useContext(DashboardContext);
        return (
            <div className={className}>
                {myOrganizations.map((id) => {
                    const organization = organizations[id];
                    const requestLink = `https://communalists.org/#/request/${id}`;
                    const inviteLink = `https://communalists.org/#/invite/${id}`;
                    const {
                        isOwner,
                        isModerator,
                        joined: userJoined,
                    } = organization?.members[uid];
                    return (
                        <Card key={id} text="light">
                            <Card.Header>
                                <Stack direction="horizontal" gap={2}>
                                    <b>{organization?.name}</b>
                                    <Badge
                                        bg={
                                            isOwner
                                                ? 'dark'
                                                : isModerator
                                                ? 'secondary'
                                                : 'light'
                                        }
                                        text={
                                            !isOwner && !isModerator
                                                ? 'dark'
                                                : 'light'
                                        }
                                    >
                                        {isOwner
                                            ? 'Owner'
                                            : isModerator
                                            ? 'Moderator'
                                            : 'Standard Member'}
                                    </Badge>
                                    <Badge bg="light" text="dark">
                                        Joined{' '}
                                        {getNumberOfDaysAfterDate(userJoined)}
                                    </Badge>
                                </Stack>
                            </Card.Header>
                            <Accordion flush={true}>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>
                                        Description
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        {organization?.about}
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Links</Accordion.Header>
                                    <Accordion.Body>
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    Request Form{' '}
                                                    <a
                                                        href={requestLink}
                                                        target="_blank"
                                                    >
                                                        (Open)
                                                    </a>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={requestLink}
                                                    disabled
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    Invite Link{' '}
                                                    <a
                                                        href={inviteLink}
                                                        target="_blank"
                                                    >
                                                        (Open)
                                                    </a>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={inviteLink}
                                                    disabled
                                                />
                                            </Form.Group>
                                        </Form>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="2">
                                    <Accordion.Header>Members</Accordion.Header>
                                    <Accordion.Body>
                                        <ListGroup>
                                            <ListGroup.Item variant="dark">
                                                <Row>
                                                    <Col>
                                                        <Stack
                                                            direction="horizontal"
                                                            gap={2}
                                                        >
                                                            Jane Doe
                                                            <Badge bg="secondary">
                                                                Moderator
                                                            </Badge>
                                                        </Stack>
                                                    </Col>
                                                    <Col>
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            style={{
                                                                float: 'right',
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            style={{
                                                                float: 'right',
                                                                marginRight:
                                                                    '5px',
                                                            }}
                                                        >
                                                            Modify Role
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>{' '}
                                            <ListGroup.Item variant="dark">
                                                <Row>
                                                    <Col>
                                                        <Stack
                                                            direction="horizontal"
                                                            gap={2}
                                                        >
                                                            Jane Doe
                                                            <Badge bg="dark">
                                                                Owner
                                                            </Badge>
                                                        </Stack>
                                                    </Col>
                                                    <Col>
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            style={{
                                                                float: 'right',
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            style={{
                                                                float: 'right',
                                                                marginRight:
                                                                    '5px',
                                                            }}
                                                        >
                                                            Modify Role
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                            <ListGroup.Item variant="dark">
                                                <Row>
                                                    <Col>
                                                        <Stack
                                                            direction="horizontal"
                                                            gap={2}
                                                        >
                                                            Jane Doe
                                                            <Badge
                                                                bg="light"
                                                                text="dark"
                                                            >
                                                                Standard
                                                            </Badge>
                                                        </Stack>
                                                    </Col>
                                                    <Col>
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            style={{
                                                                float: 'right',
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            style={{
                                                                float: 'right',
                                                                marginRight:
                                                                    '5px',
                                                            }}
                                                        >
                                                            Modify Role
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        </ListGroup>
                                        <br />
                                        <p>Requests</p>
                                        <ListGroup>
                                            <ListGroup.Item variant="dark">
                                                Jane Doe
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    style={{
                                                        float: 'right',
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    style={{
                                                        float: 'right',
                                                        marginRight: '5px',
                                                    }}
                                                >
                                                    Approve
                                                </Button>
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <Card.Footer className="text-muted">
                                Established{' '}
                                {getNumberOfDaysAfterDate(organization?.joined)}
                            </Card.Footer>
                        </Card>
                    );
                })}
            </div>
        );
    }
)(style);

export default OrganizationsList;
