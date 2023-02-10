import { Navbar, Nav, Container } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Link, useLocation } from 'react-router-dom';
import useUserState from '@api/auth-state-listener';
import authSignOut from '@api/auth-sign-out';

const routerLinks = [{ title: 'Request Aid', route: '/request-aid' }];

const Navigation: StyledComponent = styled(({ className }) => {
    const { pathname } = useLocation();
    const auth = useUserState();
    return (
        <Navbar bg="dark" variant="dark" className={className}>
            <Container>
                <Navbar.Brand>
                    <Link to="/">Communalists</Link>
                </Navbar.Brand>
                <Nav className="justify-content-end">
                    {routerLinks.map(({ title, route }) => (
                        <Link
                            className={
                                pathname.indexOf(route) === 0 ? 'active' : ''
                            }
                            key={route}
                            to={route}
                        >
                            {title}
                        </Link>
                    ))}
                    {auth ? (
                        <>
                            <Link
                                className={
                                    pathname.indexOf('dashboard') === 0
                                        ? 'active'
                                        : ''
                                }
                                to="/dashboard"
                            >
                                Dashboard
                            </Link>
                            <Link onClick={() => authSignOut()} to="/">
                                Sign Out
                            </Link>
                        </>
                    ) : (
                        <Link
                            className={
                                pathname.indexOf('sign-in') === 0
                                    ? 'active'
                                    : ''
                            }
                            to="/sign-in"
                        >
                            Sign In
                        </Link>
                    )}
                </Nav>
            </Container>
        </Navbar>
    );
})(style);

export default Navigation;
