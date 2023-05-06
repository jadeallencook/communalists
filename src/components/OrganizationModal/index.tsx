import { Badge, ListGroup, ListGroupItem, Modal } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Dispatch, useContext } from 'react';
import OrganizationInterface from '@interfaces/organization';
import DashboardContext from '../../contexts/DashboardContext';
import EyeSVG from '@assets/eye.svg';
import uidToUniqueNumber from '@utils/uid-to-unique-number';

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
        const { accounts, fetchAccount } = useContext(DashboardContext);
        const organizationAdminSet = new Set([
            ...(selectedOrganization ? selectedOrganization.admins : []),
        ]);
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
                    <ListGroup className="list-group-flush">
                        {selectedOrganization?.members.map((uid) => {
                            const hasAccount = !!accounts[uid];
                            const uniqueNumber = uidToUniqueNumber(uid);
                            return (
                                <ListGroupItem key={uid}>
                                    {organizationAdminSet.has(uid) ? (
                                        <Badge bg="primary">Moderator</Badge>
                                    ) : (
                                        <Badge bg="secondary">Standard</Badge>
                                    )}
                                    {!hasAccount
                                        ? uniqueNumber
                                        : accounts[uid]?.name ||
                                          `Anonymous ${uniqueNumber}`}
                                    {!hasAccount && (
                                        <img
                                            src={EyeSVG}
                                            className="reveal-name"
                                            onClick={() => fetchAccount(uid)}
                                        />
                                    )}
                                </ListGroupItem>
                            );
                        })}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        );
    }
)(style);

export default OrganizationModal;
