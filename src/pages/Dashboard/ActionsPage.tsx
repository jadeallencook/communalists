import RequestsTable, { Columns } from '@components/RequestsTable';
import FilterForm from '@forms/FilterForm';
import { useContext, useState } from 'react';
import DashboardContext from '../../contexts/DashboardContext';
import Loading from '@components/Loading';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import { LOCATIONS } from '@objects/locations';
import { ACTION_STAGES } from '@objects/stages';
import CreateActionModal from '@components/CreateActionModal';
import filterDocuments from '@utils/filter-documents';
import { FormFilterInterface } from '@interfaces/filters';
import ViewActionModal from '@components/ViewActionModal';

const ActionsPage = () => {
    let {
        actions,
        actionFilters,
        isLoading,
        setActionFilters,
        displayNames,
        fetchActions,
        myOrganizations,
        organizations,
    } = useContext(DashboardContext);
    const [show, setShow] = useState<boolean>(false);
    const [showCreateActionModal, setShowCreateActionModal] =
        useState<boolean>(false);
    const [selected, setSelected] = useState<string>();
    const handler = (id?: string): void => {
        setSelected(id);
        setShow((prev) => !prev);
    };

    const filteredActions = filterDocuments(actions, actionFilters);

    const columns: Columns = [
        { key: 'timestamp', title: 'Created' },
        { key: 'title', title: 'Title' },
        { key: 'stage', title: 'Stage' },
        { key: 'volunteer', title: 'Volunteer' },
    ];

    const formatters = {
        timestamp: getNumberOfDaysAfterDate,
        location: (value: string) => LOCATIONS[value],
        stage: (value: string) => ACTION_STAGES[value],
        volunteer: (value: string) => displayNames[value] || 'Not Assigned',
    };

    const filters: FormFilterInterface[] = [
        {
            name: 'stage',
            value: actionFilters.stage,
            options: ACTION_STAGES,
        },
        {
            name: 'organization',
            value: actionFilters.organization,
            options: myOrganizations.reduce(
                (previousValue, id) => ({
                    ...previousValue,
                    [id]: organizations[id]?.name,
                }),
                {}
            ),
        },
    ];

    return (
        <>
            <FilterForm
                filters={filters}
                setFilters={setActionFilters}
                toggleCreate={() => setShowCreateActionModal(true)}
                refetch={fetchActions}
            />
            {isLoading ? (
                <Loading />
            ) : (
                <RequestsTable
                    requests={filteredActions}
                    handler={handler}
                    columns={columns}
                    formatters={formatters}
                    type="Action"
                />
            )}
            <CreateActionModal
                show={showCreateActionModal}
                toggle={() => setShowCreateActionModal(false)}
            />
            {selected && (
                <ViewActionModal
                    show={show}
                    toggle={handler}
                    action={actions[selected]}
                    actionId={selected}
                />
            )}
        </>
    );
};

export default ActionsPage;
