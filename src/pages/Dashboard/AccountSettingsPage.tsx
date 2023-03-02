import getMyAccount from '@api/get-my-account';
import EditAccountForm from '@forms/EditAccountForm';
import accountInitialValues from '@objects/account-initial-values';
import { Container, Spinner } from 'react-bootstrap';
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
                <Container
                    id="loader"
                    style={{ textAlign: 'center', margin: '25px 0' }}
                >
                    <Spinner animation="border" />
                </Container>
            )}
        </>
    );
};

export default AccountSettingsPage;
