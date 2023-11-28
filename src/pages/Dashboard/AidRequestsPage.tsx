import RequestModal from '@components/RequestModal';
import RequestsTable from '@components/RequestsTable';
import FilterForm from '@forms/FilterForm';
import { useContext, useState } from 'react';
import DashboardContext from '../../contexts/DashboardContext';
import Loading from '@components/Loading';
import filterRequests from '@utils/filter-requests';
import AdvancedSearchForm from '@forms/AdvancedSearchForm';

const AidRequestsPage = () => {
    const { requests, isLoading, requestFilters, setRequestFilters, uid } =
        useContext(DashboardContext);
    const [show, setShow] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>();
    const handler = (id?: string): void => {
        setSelected(id);
        setShow((prev) => !prev);
    };

    const filteredRequests = filterRequests(requests, requestFilters);

    return (
        <>
            <FilterForm
                filters={requestFilters}
                setFilters={setRequestFilters}
            />
            <AdvancedSearchForm
                filters={requestFilters}
                setFilters={setRequestFilters}
            />
            {isLoading ? (
                <Loading />
            ) : (
                <RequestsTable requests={filteredRequests} handler={handler} />
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
