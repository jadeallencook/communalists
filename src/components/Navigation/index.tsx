import { Navbar, Nav, Container } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Link, useLocation } from 'react-router-dom';
import useUserState from '@api/auth-state-listener';
import authSignOut from '@api/auth-sign-out';
import LogoPNG from '@assets/logo.png';

const routerLinks = [{ title: 'Request Aid', route: '/request-aid' }];

const Navigation: StyledComponent = styled(({ className }) => {
    const { pathname } = useLocation();
    const auth = useUserState();
    return (
        <Navbar bg="dark" variant="dark" className={`${className} animate__animated animate__slideInDown`}>
            <Container>
                <Navbar.Brand>
                    <Link to="/">
                        <img src={LogoPNG} />
                        <span>Communalists</span>
                    </Link>
                </Navbar.Brand>
                <Nav className="justify-content-end">
                    <Link
                        className={
                            pathname.indexOf('/request-aid') === 0 ||
                            pathname === '/'
                                ? 'active request-aid'
                                : 'request-aid'
                        }
                        to={'/request-aid'}
                    >
                        Submit Request
                    </Link>
                    {auth ? (
                        <>
                            <Link
                                className={
                                    pathname.indexOf('/dashboard') === 0
                                        ? 'active'
                                        : ''
                                }
                                to="/dashboard"
                            >
                                Dashboard
                            </Link>
                            <Link onClick={() => authSignOut()} to="/">
                                Log Out
                            </Link>
                        </>
                    ) : (
                        <Link
                            className={
                                pathname.indexOf('/sign-in') === 0
                                    ? 'active'
                                    : ''
                            }
                            to="/sign-in"
                        >
                            Log In
                        </Link>
                    )}
                </Nav>
            </Container>
        </Navbar>
    );
})(style);

export default Navigation;
