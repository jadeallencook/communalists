import { useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const DashboardNavigation: StyledComponent = styled(
    ({
        className,
        routes,
    }: {
        className: string;
        routes: {
            'aid-requests': React.Component;
        };
    }) => {
        const [route, setRoute] = useState<string>('aid-requests');

        const links = [
            { link: 'aid-requests', text: 'Aid Requests' },
            { link: 'volunteer-requests', text: 'Volunteer Requests' },
            { link: 'account-settings', text: 'Account Settings' },
        ];

        return (
            <>
                <Nav
                    variant="tabs"
                    defaultActiveKey="/dashboard"
                    className={className}
                >
                    {links.map(({ link, text }) => (
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
                    ))}
                </Nav>
                {routes[route]}
            </>
        );
    }
)(style);

export default DashboardNavigation;
