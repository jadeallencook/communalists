import Loading from '@components/Loading';
import { useContext, useEffect, useState } from 'react';
import DashboardContext from '../../contexts/DashboardContext';
import NewAccount from '@components/NewAccount';
import { Button } from 'react-bootstrap';
import CreateOrganizationModal from '@components/CreateOrganizationModal';
import OrganizationsList from '@components/OrganizationsList';

const OverviewPage = () => {
    const { isLoading, myOrganizations } = useContext(DashboardContext);
    const [isCreateOrganizationModalOpen, setIsCreateOrganizationModalOpen] =
        useState<boolean>(false);
    const isMemberOfOrganization = myOrganizations.length > 0;

    if (isLoading) {
        return <Loading />;
    }

    return (
        <>
            {isMemberOfOrganization ? <OrganizationsList /> : <NewAccount />}
            <Button
                onClick={() =>
                    setIsCreateOrganizationModalOpen((prev) => !prev)
                }
            >
                Start An Organization
            </Button>
            <CreateOrganizationModal
                show={isCreateOrganizationModalOpen}
                toggle={() => setIsCreateOrganizationModalOpen((prev) => !prev)}
            />
        </>
    );
};

export default OverviewPage;
