enum AccessLevel {
    // guest is used for components that are accessible by anyone
    Guest = 0,
    // member is an authenticated user that belongs to an organization
    Member = 1,
    // moderator is an authenticated user that manages an organization
    Moderator = 2,
    // administrator is an authenticated user that owns the organization
    Administrator = 3,
}

export default AccessLevel;
