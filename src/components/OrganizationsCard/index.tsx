import { Badge, Button, Card, ListGroup } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import AccountInterface from '@interfaces/account';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import roles from '@objects/roles';
import locations from '@objects/locations';
import OrganizationInterface from '@interfaces/organization';

const OrganizationsCard: StyledComponent = styled(
    ({
        className,
        organizations,
    }: {
        className: string;
        organizations: { [key: string]: OrganizationInterface };
    }) => {
        const total = Object.keys(organizations).length;
        return (
            <Card className={className} text="light" bg="danger">
                <Card.Header>
                    <b>Organizations</b>
                </Card.Header>
                <ListGroup className="list-group-flush">
                    {Object.entries(organizations).map(
                        ([key, organization], index) => {
                            if (!organization) return null;
                            const { name, joined, members } = organization;
                            const days = getNumberOfDaysAfterDate(joined);
                            const uniqueKey = `${key}-${index}`;
                            return (
                                <ListGroup.Item key={uniqueKey}>
                                    <Button>Send Request</Button>
                                    <Button variant="secondary">
                                        View Members
                                    </Button>
                                    {name} <br />
                                    <Badge bg="dark">
                                        {members.length} Member
                                        {members.length !== 1 && 's'}
                                    </Badge>
                                    <Badge bg="secondary">Joined {days}</Badge>
                                </ListGroup.Item>
                            );
                        }
                    )}
                </ListGroup>
                <Card.Footer>
                    {total} Organization{total !== 1 && 's'}
                </Card.Footer>
            </Card>
        );
    }
)(style);

export default OrganizationsCard;
