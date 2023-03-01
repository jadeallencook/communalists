import { RoleKeyType } from '@custom-types/role';

type RoleInterface = {
    [key in RoleKeyType]: boolean;
};

export default RoleInterface;
