import getUnapprovedAccounts from '@api/get-unapproved-accounts';
import ApplicationModal from '@components/ApplicationModal';
import ApplicationsTable from '@components/ApplicationsTable';
import AccountInterface from '@interfaces/account';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

const ApplicationsPage = () => {
    const {
        isLoading,
        data: applications,
        refetch,
    } = useQuery('@applications', getUnapprovedAccounts);

    const [application, setApplication] = useState<AccountInterface | null>(
        null
    );

    const [uid, setUID] = useState<string>('');

    useEffect(() => {
        if (applications) {
            refetch();
            setApplication(applications[uid] || null);
        }
    }, [uid]);

    return (
        <>
            <ApplicationsTable
                setUID={setUID}
                applications={applications}
                isLoading={isLoading}
            />
            <ApplicationModal
                uid={uid}
                application={application}
                setUID={setUID}
            />
        </>
    );
};

export default ApplicationsPage;
