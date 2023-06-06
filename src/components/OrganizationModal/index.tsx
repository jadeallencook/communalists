import { Badge, ListGroup, ListGroupItem, Modal } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Dispatch, useContext } from 'react';
import OrganizationInterface from '@interfaces/organization';
import DashboardContext from '../../contexts/DashboardContext';

const OrganizationModal: StyledComponent = styled(
    ({
        className,
        selectedOrganizationId,
        setSelectedOrganizationId,
        selectedOrganization,
    }: {
        className: string;
        selectedOrganizationId: string;
        setSelectedOrganizationId: Dispatch<string>;
        selectedOrganization: OrganizationInterface;
    }) => {
        const { approveRequestToJoinOrganization, isLoading, displayNames } =
            useContext(DashboardContext);
        const organizationModeratorsSet = new Set([
            ...(selectedOrganization ? selectedOrganization.moderators : []),
        ]);
        const { uid } = useContext(DashboardContext);
        const isOrganizationModerator = organizationModeratorsSet.has(uid);
        return (
            <Modal
                show={!!selectedOrganizationId}
                size="lg"
                onHide={() => setSelectedOrganizationId('')}
                className={className}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{selectedOrganization?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isOrganizationModerator &&
                        !!selectedOrganization?.requests?.length && (
                            <>
                                <p>
                                    <b>Member Requests</b>
                                </p>
                                <ListGroup className="list-group-flush">
                                    {selectedOrganization?.requests.map(
                                        (userUID) => (
                                            <ListGroupItem key={userUID}>
                                                <Badge
                                                    bg={
                                                        isLoading
                                                            ? 'secondary'
                                                            : 'primary'
                                                    }
                                                    className="approve-request"
                                                    onClick={
                                                        !isLoading
                                                            ? () =>
                                                                  approveRequestToJoinOrganization(
                                                                      userUID,
                                                                      selectedOrganizationId
                                                                  )
                                                            : null
                                                    }
                                                >
                                                    {isLoading
                                                        ? 'Loading'
                                                        : 'Approve'}
                                                </Badge>
                                                {displayNames[userUID] ||
                                                    'Anonymous'}
                                            </ListGroupItem>
                                        )
                                    )}
                                </ListGroup>
                                <br />
                            </>
                        )}
                    <p>
                        <b>{selectedOrganization?.members.length} Members</b>
                    </p>
                    <ListGroup className="list-group-flush">
                        {selectedOrganization?.members.map((userUID) => (
                            <ListGroupItem key={userUID}>
                                {organizationModeratorsSet.has(userUID) ? (
                                    <Badge bg="primary">Moderator</Badge>
                                ) : (
                                    <Badge bg="secondary">Standard</Badge>
                                )}
                                {displayNames[userUID] || 'Anonymous'}
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        );
    }
)(style);

export default OrganizationModal;
