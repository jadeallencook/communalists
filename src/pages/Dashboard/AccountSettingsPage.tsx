import getMyAccount from '@api/get-my-account';
import Loading from '@components/Loading';
import EditAccountForm from '@forms/EditAccountForm';
import accountInitialValues from '@objects/account-initial-values';
import { useQuery } from 'react-query';

const AccountSettingsPage = () => {
    const { isLoading, data: account } = useQuery('@account', getMyAccount);
    return (
        <>
            {!isLoading ? (
                <EditAccountForm
                    initialValues={account || accountInitialValues}
                />
            ) : (
                <Loading />
            )}
        </>
    );
};

export default AccountSettingsPage;
