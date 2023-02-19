import RequestModal from '@components/RequestModal';
import RequestsTable from '@components/RequestsTable';
import FilterForm from '@forms/FilterForm';
import getRequests from '@api/get-requests';
import RequestAidInterface from '@interfaces/request-aid';
import { useEffect, useState } from 'react';
import { FiltersInterface } from '@interfaces/filters';

const AidRequestsPage = () => {
    const [requests, setRequests] = useState<{
        [key: string]: RequestAidInterface;
    }>({});

    const [loaded, setLoaded] = useState<boolean>(false);
    const [refetch, setRefetch] = useState<boolean>(true);
    const [show, setShow] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>();
    const [filters, setFilters] = useState<FiltersInterface>({
        location: '',
        language: '',
        driver: '',
        stage: 'submitted',
    });
    const handler = (id?: string, shouldRefetch?: boolean): void => {
        setSelected(id);
        setShow((prev) => !prev);
        if (shouldRefetch) {
            setRefetch(true);
        }
    };

    useEffect(() => {
        setLoaded(false);
        if (refetch) {
            getRequests(filters).then((requests) => {
                setRequests(requests);
                setLoaded(true);
            });
        }
        setRefetch(false);
    }, [refetch]);

    return (
        <>
            <FilterForm
                filters={filters}
                setFilters={setFilters}
                setRefetch={setRefetch}
            />
            <RequestsTable
                requests={requests}
                handler={handler}
                loaded={loaded}
            />
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
