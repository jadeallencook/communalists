import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Link, useLocation } from 'react-router-dom';
import LogoPNG from '@assets/logo.png';
import { useContext } from 'react';
import SnippetContext from '../../contexts/SnippetContext';
import languages from '@objects/languages';
import { LanguageKeyType } from '@custom-types/languages';
import DashboardContext from '../../contexts/DashboardContext';

const Navigation: StyledComponent = styled(({ className }) => {
    const { pathname } = useLocation();
    const { uid } = useContext(DashboardContext);
    const { setLanguage, language, snippet } = useContext(SnippetContext);
    const { signOut } = useContext(DashboardContext);
    return (
        <Navbar
            bg="dark"
            variant="dark"
            sticky="top"
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
                        <span className="tablet-remove">
                            {snippet('communalists')}
                        </span>
                    </Link>
                </Navbar.Brand>
                <Nav className="justify-content-end">
                    <Link
                        className={
                            pathname.indexOf('/request-aid') === 0 ||
                            pathname === '/'
                                ? 'active tablet-remove nav-link'
                                : 'tablet-remove nav-link'
                        }
                        to={'/request-aid'}
                    >
                        {snippet('submit-request', 'navigation')}
                    </Link>
                    <Link
                        className={
                            pathname.indexOf('/donate') === 0
                                ? 'active nav-link'
                                : 'nav-link'
                        }
                        to="/donate"
                    >
                        {snippet('donate', 'navigation')}
                    </Link>
                    {uid ? (
                        <>
                            <Link
                                className={
                                    pathname.indexOf('/dashboard') === 0
                                        ? 'active nav-link'
                                        : 'nav-link'
                                }
                                to="/dashboard"
                            >
                                {snippet('dashboard', 'navigation')}
                            </Link>
                            <Link onClick={signOut} to="/" className="nav-link">
                                {snippet('log-out', 'navigation')}
                            </Link>
                        </>
                    ) : (
                        <Link
                            className={
                                pathname.indexOf('/sign-in') === 0
                                    ? 'active nav-link'
                                    : 'nav-link'
                            }
                            to="/sign-in"
                        >
                            {snippet('log-in', 'navigation')}
                        </Link>
                    )}
                    <NavDropdown
                        title={languages[language]}
                        menuVariant="dark"
                        onSelect={(key: LanguageKeyType) => setLanguage(key)}
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
