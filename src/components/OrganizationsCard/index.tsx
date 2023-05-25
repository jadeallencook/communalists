import { Badge, Button, Card, ListGroup } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import OrganizationInterface from '@interfaces/organization';
import { Dispatch, useContext } from 'react';
import DashboardContext from '../../contexts/DashboardContext';

const OrganizationsCard: StyledComponent = styled(
    ({
        className,
        organizations,
        setSelected,
    }: {
        className: string;
        organizations: { [key: string]: OrganizationInterface };
        setSelected: Dispatch<string>;
    }) => {
        const total = Object.keys(organizations).length;
        const { uid, requestToJoinOrganization } = useContext(DashboardContext);
        return (
            <Card className={className} text="light" bg="danger">
                <Card.Header>
                    <b>Organizations</b>
                </Card.Header>
                <ListGroup className="list-group-flush">
                    {Object.entries(organizations).map(
                        ([organizationUID, organization], index) => {
                            if (!organization) return null;
                            const { name, joined, members, requests } =
                                organization;
                            const days = getNumberOfDaysAfterDate(joined);
                            const uniqueKey = `${organizationUID}-${index}`;
                            const isRequestingToJoin: boolean =
                                requests?.indexOf(uid) > -1;

                            return (
                                <ListGroup.Item key={uniqueKey}>
                                    {members.indexOf(uid) > -1 ? (
                                        <Button
                                            variant="secondary"
                                            onClick={() =>
                                                setSelected(organizationUID)
                                            }
                                        >
                                            View Members
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            onClick={
                                                isRequestingToJoin
                                                    ? null
                                                    : () =>
                                                          requestToJoinOrganization(
                                                              uid,
                                                              organizationUID
                                                          )
                                            }
                                            disabled={isRequestingToJoin}
                                        >
                                            {isRequestingToJoin
                                                ? 'Request Pending'
                                                : 'Join Organization'}
                                        </Button>
                                    )}
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
