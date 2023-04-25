import { OrganizationKeyType } from '@custom-types/organizations';
import roles from '@objects/roles';
import AccountInterface from '@interfaces/account';

interface OrganizedAccountsInterface {
    [key: string]: {
        total?: number;
        accounts?: string[];
    };
}

const organizeAccounts = (accounts: {
    [key: string]: AccountInterface;
}): OrganizedAccountsInterface =>
    Object.entries(accounts).reduce((acc, [accountKey, account]) => {
        if (!acc[account.organization]) {
            acc[account.organization] = {};
            acc[account.organization].accounts = [];
            acc[account.organization].total = 1;
        } else {
            acc[account.organization].total++;
        }

        acc[account.organization].accounts.push(accountKey);

        Object.entries(roles).forEach(([roleKey]) => {
            if (account.role[roleKey]) {
                if (!acc[account.organization][roleKey]) {
                    acc[account.organization][roleKey] = 1;
                } else {
                    acc[account.organization][roleKey]++;
                }
            }
        });

        return acc;
    }, {});

export default organizeAccounts;
