import React from 'react';
import { AppShell, NavLink } from '@mantine/core';

const Navbar = () => (
    <AppShell.Navbar p="md">
        <NavLink
            label="San Jose Mutual Aid"
            description="Manage Forms & Responses"
            defaultOpened
        >
            <NavLink label="San Jose Mutual Aid" />
            <NavLink label="San Francisco Food Not Bombs" />
            <NavLink label="Local 801 Tool Library" />
            <NavLink label="Create New Organization" />
        </NavLink>
        <NavLink
            variant="filled"
            label="Home"
            description="Discover Our Community Mission"
            active
        />
        <NavLink label="Dashboard" description="Manage Forms & Responses" />
        <NavLink label="Members" description="View Members In Organization" />
        <NavLink label="Settings" description="Adjust Your Personal Settings" />
    </AppShell.Navbar>
);

export default Navbar;
