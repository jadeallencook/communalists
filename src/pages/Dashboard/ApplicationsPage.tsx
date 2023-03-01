import getApplications from '@api/get-applications';
import ApplicationModal from '@components/ApplicationModal';
import ApplicationsTable from '@components/ApplicationsTable';
import VolunteerApplicationInterface from '@interfaces/volunteer-application';
import { useState } from 'react';
import { useQuery } from 'react-query';

const ApplicationsPage = () => {
    const { isLoading, data: applications } = useQuery(
        'applications',
        getApplications
    );

    const [applicaton, setApplication] =
        useState<VolunteerApplicationInterface | null>(null);

    const handler = (id: string) => setApplication(applications[id]);

    return (
        <>
            <ApplicationsTable
                handler={handler}
                applications={applications}
                isLoading={isLoading}
            />
            <ApplicationModal
                application={applicaton}
                setApplication={setApplication}
            />
        </>
    );
};

export default ApplicationsPage;
