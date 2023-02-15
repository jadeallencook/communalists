import { Navbar, Nav, Container, Dropdown, NavDropdown } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Link, useLocation } from 'react-router-dom';
import useUserState from '@api/auth-state-listener';
import authSignOut from '@api/auth-sign-out';
import LogoPNG from '@assets/logo.png';
import { useContext } from 'react';
import SnippetContext from '../../contexts/SnippetContext';
import languages from '@objects/languages';
import { LanguageKeyTypes } from '@custom-types/languages';

const Navigation: StyledComponent = styled(({ className }) => {
    const { pathname } = useLocation();
    const auth = useUserState();
    const { setLanguage, language } = useContext(SnippetContext);
    return (
        <Navbar
            bg="dark"
            variant="dark"
            className={`${className} animate__animated animate__slideInDown`}
        >
            <Container>
                <Navbar.Brand>
                    <Link to="/">
                        <img
                            src={LogoPNG}
                            style={{ animationDelay: '.5s' }}
                            className="animate__animated animate__rotateIn"
                        />
                        <span>Communalists</span>
                    </Link>
                </Navbar.Brand>
                <Nav className="justify-content-end">
                    <Nav.Link>
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
                    </Nav.Link>
                    {auth ? (
                        <>
                            <Nav.Link>
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
                            </Nav.Link>
                            <Nav.Link>
                                <Link onClick={() => authSignOut()} to="/">
                                    Log Out
                                </Link>
                            </Nav.Link>
                        </>
                    ) : (
                        <Nav.Link>
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
                        </Nav.Link>
                    )}
                    <NavDropdown
                        title={languages[language]}
                        menuVariant="dark"
                        onSelect={(key: LanguageKeyTypes) => setLanguage(key)}
                    >
                        {Object.entries(languages).map(([key, text]) => (
                            <NavDropdown.Item
                                key={key}
                                active={key === language}
                                eventKey={key}
                            >
                                {text}
                            </NavDropdown.Item>
                        ))}
                    </NavDropdown>
                </Nav>
            </Container>
        </Navbar>
    );
})(style);

export default Navigation;
