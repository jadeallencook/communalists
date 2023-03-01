import { DashboardRouteLinkType } from '@custom-types/dashboard-route-link';
import {
    DashboardRoutesInterface,
    DashboardRouteInterface,
} from '@interfaces/dashboard-router';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const DashboardNavigation: StyledComponent = styled(
    ({
        className,
        routes,
        route,
    }: {
        className: string;
        routes: DashboardRoutesInterface;
        route: string;
    }) => {
        return (
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
                            <Link
                                className={`nav-link ${
                                    route === link && 'active'
                                }`}
                                to={`/dashboard/${link}`}
                            >
                                {text}
                            </Link>
                        </Nav.Item>
                    )
                )}
            </Nav>
        );
    }
)(style);

export default DashboardNavigation;
