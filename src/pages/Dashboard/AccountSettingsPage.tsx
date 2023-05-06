import Loading from '@components/Loading';
import EditAccountForm from '@forms/EditAccountForm';
import { useContext } from 'react';
import DashboardContext from '../../contexts/DashboardContext';

const AccountSettingsPage = () => {
    const { isLoading } = useContext(DashboardContext);
    return <>{!isLoading ? <EditAccountForm /> : <Loading />}</>;
};

export default AccountSettingsPage;
