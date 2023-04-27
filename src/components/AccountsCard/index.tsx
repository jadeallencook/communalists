import { Badge, Card, ListGroup } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import AccountInterface from '@interfaces/account';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import roles from '@objects/roles';
import locations from '@objects/locations';

const AccountsCard: StyledComponent = styled(
    ({
        className,
        accounts,
    }: {
        className: string;
        accounts: { [key: string]: AccountInterface };
    }) => (
        <Card className={className} text="light" bg="danger">
            <Card.Header>
                <b>Volunteers</b>
            </Card.Header>
            <ListGroup className="list-group-flush">
                {Object.entries(accounts).map(([key, account], index) => {
                    if (!account) return null;
                    const { name, joined, role, location } = account;
                    const days = getNumberOfDaysAfterDate(joined);
                    const uniqueKey = `${key}-${index}`;
                    return (
                        <ListGroup.Item key={uniqueKey}>
                            {name} <br />
                            <Badge bg="dark">{locations[location]}</Badge>
                            <Badge bg="secondary">Joined {days}</Badge>
                            <br />
                            {role &&
                                Object.entries(role).map(
                                    ([roleKey, hasRole]) =>
                                        hasRole && (
                                            <Badge
                                                key={`${uniqueKey}-${roleKey}`}
                                                bg="danger"
                                                className="role-badge"
                                            >
                                                {roles[roleKey]}
                                            </Badge>
                                        )
                                )}
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
            <Card.Footer>{Object.keys(accounts).length} Members</Card.Footer>
        </Card>
    )
)(style);

export default AccountsCard;
