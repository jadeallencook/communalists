import RequestModal from '@components/RequestModal';
import RequestsTable, { Columns } from '@components/RequestsTable';
import FilterForm from '@forms/FilterForm';
import { useContext, useState } from 'react';
import DashboardContext from '../../contexts/DashboardContext';
import Loading from '@components/Loading';
import filterRequests from '@utils/filter-requests';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import locations from '@objects/locations';
import languages from '@objects/languages';

const AidRequestsPage = () => {
    let { requests, isLoading, requestFilters, setRequestFilters } =
        useContext(DashboardContext);
    const [show, setShow] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>();
    const handler = (id?: string): void => {
        setSelected(id);
        setShow((prev) => !prev);
    };

    requests = filterRequests(requests, requestFilters);

    const columns: Columns = [
        { key: 'timestamp', title: 'Recieved' },
        { key: 'name', title: 'Name' },
        { key: 'location', title: 'Location' },
        { key: 'language', title: 'Language' },
    ];

    const formatters = {
        timestamp: getNumberOfDaysAfterDate,
        location: (value: string) => locations[value],
        language: (value: string) => languages[value],
    };

    return (
        <>
            <FilterForm
                filters={requestFilters}
                setFilters={setRequestFilters}
            />
            {isLoading ? (
                <Loading />
            ) : (
                <RequestsTable
                    requests={requests}
                    handler={handler}
                    columns={columns}
                    formatters={formatters}
                />
            )}
            {selected && (
                <RequestModal
                    show={show}
                    handler={handler}
                    selected={selected}
                    request={requests[selected]}
                />
            )}
        </>
    );
};

export default AidRequestsPage;
