import { DashboardRouteLinkType } from '@custom-types/dashboard-route-link';
import {
    DashboardRoutesInterface,
    DashboardRouteInterface,
} from '@interfaces/dashboard-router';
import { useState } from 'react';
import { Nav } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const DashboardNavigation: StyledComponent = styled(
    ({
        className,
        routes,
    }: {
        className: string;
        routes: DashboardRoutesInterface;
    }) => {
        const [route, setRoute] =
            useState<DashboardRouteLinkType>('aid-requests');

        return (
            <>
                <Nav
                    variant="tabs"
                    defaultActiveKey="/dashboard"
                    className={className}
                >
                    {Object.entries(routes).map(
                        ([link, { text }]: [
                            DashboardRouteLinkType,
                            DashboardRouteInterface
                        ]) => (
                            <Nav.Item key={link}>
                                <Nav.Link
                                    className={`nav-link ${
                                        route === link && 'active'
                                    }`}
                                    onClick={() => setRoute(link)}
                                >
                                    {text}
                                </Nav.Link>
                            </Nav.Item>
                        )
                    )}
                </Nav>
                {routes[route].component}
            </>
        );
    }
)(style);

export default DashboardNavigation;
