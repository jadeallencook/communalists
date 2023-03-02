import { LocationKeyType } from '@custom-types/locations';
import { OrganizationKeyType } from '@custom-types/organizations';
import RoleInterface from './roles';

interface AccountInterface {
    name: string;
    location: LocationKeyType;
    role: RoleInterface;
    organization: OrganizationKeyType;
}

export default AccountInterface;
