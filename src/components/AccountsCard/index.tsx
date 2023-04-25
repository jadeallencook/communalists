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
        title,
        members,
        total,
        key,
        accounts,
    }: {
        className: string;
        title: string;
        members: string[];
        total: number;
        key: string;
        accounts: { [key: string]: AccountInterface };
    }) => (
        <Card className={className} text="light" bg="danger">
            <Card.Header>
                <b>{title}</b>
            </Card.Header>
            <ListGroup className="list-group-flush">
                {members.map((accountKey, membersIndex) => {
                    const account = accounts[accountKey];
                    if (!account) return null;
                    const { name, joined, role, location } = account;
                    const days = getNumberOfDaysAfterDate(joined);
                    const uniqueKey = `${key}-${membersIndex}`;
                    return (
                        <ListGroup.Item key={uniqueKey}>
                            {name} <br />
                            <Badge bg="dark">{locations[location]}</Badge>
                            <Badge bg="secondary">Joined {days}</Badge>
                            <br />
                            {Object.entries(role).map(
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
            <Card.Footer>{total || 'No'} Members</Card.Footer>
        </Card>
    )
)(style);

export default AccountsCard;
