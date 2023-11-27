import OrganizationInterface from '@interfaces/organization';

const isUserModerator = (
    uid: string,
    myOrganizations: string[],
    organizations: { [key: string]: OrganizationInterface }
) => {
    for (const organization of myOrganizations) {
        if (organizations?.[organization]?.moderators.includes(uid)) {
            return true;
        }
    }
    return false;
};

export default isUserModerator;
