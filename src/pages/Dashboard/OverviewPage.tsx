import OrganizationsCard from '@components/OrganizationsCard';
import Loading from '@components/Loading';
import { useContext, useEffect, useState } from 'react';
import DashboardContext from '../../contexts/DashboardContext';
import OrganizationModal from '@components/OrganizationModal';

const OverviewPage = () => {
    const { organizations, isLoading, fetchOrganization } =
        useContext(DashboardContext);
    const [selectedOrganizationId, setSelectedOrganizationId] =
        useState<string>('');
    const selectedOrganization = organizations[selectedOrganizationId];

    useEffect(() => {
        if (selectedOrganizationId) {
            fetchOrganization(selectedOrganizationId);
        }
    }, [selectedOrganizationId]);

    return (
        <>
            {isLoading && !selectedOrganizationId ? (
                <Loading />
            ) : (
                !!Object.keys(organizations).length && (
                    <OrganizationsCard
                        organizations={organizations}
                        setSelected={setSelectedOrganizationId}
                    />
                )
            )}
            <OrganizationModal
                selectedOrganizationId={selectedOrganizationId}
                setSelectedOrganizationId={setSelectedOrganizationId}
                selectedOrganization={selectedOrganization}
            />
        </>
    );
};

export default OverviewPage;
