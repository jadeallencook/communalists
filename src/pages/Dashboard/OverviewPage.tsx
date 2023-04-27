import getOrganizations from '@api/get-organizations';
import OrganizationsCard from '@components/OrganizationsCard';
import Loading from '@components/Loading';
import { useQuery } from 'react-query';

const OverviewPage = () => {
    const { isLoading, data: organizations } = useQuery(
        '@organizations',
        getOrganizations
    );
    return isLoading ? (
        <Loading />
    ) : (
        !!Object.keys(organizations).length && (
            <OrganizationsCard organizations={organizations} />
        )
    );
};

export default OverviewPage;
