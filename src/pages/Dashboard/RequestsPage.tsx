import ViewRequestModal from '@components/ViewRequestModal';
import RequestsTable, { Columns } from '@components/RequestsTable';
import FilterForm from '@forms/FilterForm';
import { useContext, useState } from 'react';
import DashboardContext from '../../contexts/DashboardContext';
import Loading from '@components/Loading';
import filterDocuments from '@utils/filter-documents';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import { LOCATIONS } from '@objects/locations';
import { LANGUAGES } from '@objects/languages';
import { DRIVER_STATUSES } from '@objects/driver-status';
import { REQUEST_STAGES } from '@objects/stages';

const RequestsPage = () => {
    let {
        requests,
        isLoading,
        requestFilters,
        setRequestFilters,
        fetchRequests,
        myOrganizations,
        organizations,
    } = useContext(DashboardContext);
    const [show, setShow] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>();
    const handler = (id?: string): void => {
        setSelected(id);
        setShow((prev) => !prev);
    };

    requests = filterDocuments(requests, requestFilters);

    const columns: Columns = [
        { key: 'timestamp', title: 'Recieved' },
        { key: 'name', title: 'Name' },
        { key: 'location', title: 'Location' },
        { key: 'language', title: 'Language' },
    ];

    const formatters = {
        timestamp: getNumberOfDaysAfterDate,
        location: (value: string) => LOCATIONS[value],
        language: (value: string) => LANGUAGES[value],
    };

    const filters = [
        {
            name: 'driver',
            value: requestFilters.driver,
            options: DRIVER_STATUSES,
            defaultValue: 'Any Driver Status',
        },
        {
            name: 'stage',
            value: requestFilters.stage,
            options: REQUEST_STAGES,
        },
        {
            name: 'organization',
            value: requestFilters.organization,
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
                setFilters={setRequestFilters}
                refetch={fetchRequests}
            />
            {isLoading ? (
                <Loading />
            ) : (
                <RequestsTable
                    requests={requests}
                    handler={handler}
                    columns={columns}
                    formatters={formatters}
                    type="request"
                />
            )}
            {selected && (
                <ViewRequestModal
                    show={show}
                    handler={handler}
                    selected={selected}
                    request={requests[selected]}
                />
            )}
        </>
    );
};

export default RequestsPage;
