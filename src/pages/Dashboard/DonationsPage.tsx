import FilterForm from '@forms/FilterForm';
import { useEffect, useState } from 'react';
import { FiltersInterface } from '@interfaces/filters';
import getDonations from '@api/get-donations';
import DonationsTable from '@components/DonationsTable';
import DonationModal from '@components/DonationModal';
import DonationInterface from '@interfaces/donation';

const DonationsPage = () => {
    const [donations, setDonations] = useState<{
        [key: string]: DonationInterface;
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
        coordinator: '',
        searchQuery: '',
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
            getDonations(filters).then((response) => {
                setDonations(response);
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
            <DonationsTable
                donations={donations}
                handler={handler}
                loaded={loaded}
            />
            {selected && (
                <DonationModal
                    show={show}
                    handler={handler}
                    selected={selected}
                    donation={donations[selected]}
                />
            )}
        </>
    );
};

export default DonationsPage;
