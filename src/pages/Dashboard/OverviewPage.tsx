import getVolunteers from '@api/get-volunteers';
import AccountsCard from '@components/AccountsCard';
import Loading from '@components/Loading';
import organizations from '@objects/organizations';
import organizeAccounts from '@utils/organize-accounts';
import { useQuery } from 'react-query';

const OverviewPage = () => {
    const { isLoading, data: allAccounts } = useQuery(
        '@accounts',
        getVolunteers
    );
    if (isLoading) return <Loading />;
    const organizedAccounts = organizeAccounts(allAccounts);
    return (
        <>
            {Object.entries(organizations).map(
                ([organizationKey, organizationTitle]) => {
                    const organization = organizedAccounts[organizationKey];
                    return organization?.total ? (
                        <AccountsCard
                            key={organizationKey}
                            title={organizationTitle}
                            accounts={allAccounts}
                            members={organization?.accounts}
                            total={organization.total}
                        />
                    ) : null;
                }
            )}
        </>
    );
};

export default OverviewPage;
