import React from 'react';
import { AppShell, NavLink } from '@mantine/core';

const Navbar = () => (
    <AppShell.Navbar p="md">
        <NavLink label="Home" description="Discover Our Community Mission" />
        <NavLink label="Dashboard" description="Manage Forms & Responses" />
        <NavLink label="Members" description="View Members In Organization" />
        <NavLink label="Settings" description="Adjust Your Personal Settings" />
        <NavLink label="Login" description="Sign In to Your Account" />
        <NavLink label="Logout" description="Securely Log Out" />
    </AppShell.Navbar>
);

export default Navbar;
