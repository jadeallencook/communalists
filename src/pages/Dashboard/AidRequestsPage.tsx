import RequestModal from '@components/RequestModal';
import RequestsTable from '@components/RequestsTable';
import FilterForm from '@forms/FilterForm';
import { useContext, useState } from 'react';
import DashboardContext from '../../contexts/DashboardContext';
import Loading from '@components/Loading';

const AidRequestsPage = () => {
    const { requests, isLoading, requestFilters, setRequestFilters, uid } =
        useContext(DashboardContext);
    const [show, setShow] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>();
    const handler = (id?: string): void => {
        setSelected(id);
        setShow((prev) => !prev);
    };

    const filteredRequests = Object.entries(requests).reduce(
        (object, [id, request]) => {
            const { stage, location, language, driver, coordinator } =
                requestFilters;
            return stage !== request.stage ||
                (location && location !== request.location) ||
                (language && language !== request.language) ||
                (driver && driver !== request.driver) ||
                (coordinator && coordinator !== request.coordinator)
                ? object
                : {
                      ...object,
                      [id]: request,
                  };
        },
        {}
    );

    return isLoading ? (
        <Loading />
    ) : (
        <>
            <FilterForm
                filters={requestFilters}
                setFilters={setRequestFilters}
            />
            <RequestsTable requests={filteredRequests} handler={handler} />
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
