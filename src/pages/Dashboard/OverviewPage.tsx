import getVolunteers from '@api/get-volunteers';
import AccountsCard from '@components/AccountsCard';
import Loading from '@components/Loading';
import { useQuery } from 'react-query';

const OverviewPage = () => {
    const { isLoading, data: accounts } = useQuery('@accounts', getVolunteers);
    if (isLoading) return <Loading />;
    else return <AccountsCard accounts={accounts} />;
};

export default OverviewPage;
