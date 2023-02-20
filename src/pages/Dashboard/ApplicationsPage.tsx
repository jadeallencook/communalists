import getApplications from '@api/get-applications';
import ApplicationsTable from '@components/ApplicationsTable';
import { useQuery } from 'react-query';

const ApplicationsPage = () => {
    const { isLoading, data: applications } = useQuery(
        'applications',
        getApplications
    );
    return (
        <>
            <h1>Volunteer Applications</h1>
            <ApplicationsTable
                applications={applications}
                isLoading={isLoading}
            />
        </>
    );
};

export default ApplicationsPage;
