import RequestAidForm from '@forms/RequestAidForm/index';
import { useContext, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import DashboardContext from '../contexts/DashboardContext';
import Loading from '@components/Loading';

const RequestAidPage = () => {
    const { id } = useParams();
    const { fetchOrganization, isLoading, organizations } =
        useContext(DashboardContext);
    const organization = organizations[id];
    useEffect(() => {
        fetchOrganization(id);
    }, []);

    return isLoading || !Object.keys(organizations).length ? (
        <Loading />
    ) : (
        <Container>
            <RequestAidForm organization={organization} />
        </Container>
    );
};

export default RequestAidPage;
