import Loading from '@components/Loading';
import { useContext, useEffect } from 'react';
import { Badge, Button, Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import DashboardContext from '../contexts/DashboardContext';

const OrganizationInvitePage = () => {
    const { id } = useParams();
    const { fetchOrganization, isLoading, organizations, uid } =
        useContext(DashboardContext);
    const organization = organizations?.[id];
    const { name, about, members } = organization || {};
    const isMember = members?.[uid] ? members[uid].isMember : false;
    const isBlocked = members?.[uid] ? members[uid].isBlocked : false;

    useEffect(() => {
        fetchOrganization(id);
    }, []);

    console.log({ name, about, members, uid, isMember });

    return isLoading ? (
        <Loading />
    ) : (
        <Container>
            <h1>{name}</h1>
            <p>{about}</p>
            {isMember && !isBlocked && (
                <Badge bg="secondary">
                    You're already a member of this organization.
                </Badge>
            )}
            {isBlocked && (
                <Badge bg="danger">
                    You're blocked from this organization.
                </Badge>
            )}
            {!isMember && !isBlocked && (
                <Button disabled={isMember}>Join Organization</Button>
            )}
        </Container>
    );
};

export default OrganizationInvitePage;
