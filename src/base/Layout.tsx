/*
    This file is used to wrap all the pages with a common layout.
    For example, if you want to add a header and footer to all the pages,
    you can add it here.
*/

import React from 'react';
import { AppShell, Burger, Group, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Navbar from './Navbar';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
            }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger
                        opened={mobileOpened}
                        onClick={toggleMobile}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <Burger
                        opened={desktopOpened}
                        onClick={toggleDesktop}
                        visibleFrom="sm"
                        size="sm"
                    />
                    <b>Communalists</b>
                </Group>
            </AppShell.Header>
            <Navbar />
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
};

export default Layout;
