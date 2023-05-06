import {
    Navbar,
    Nav,
    Container,
    NavDropdown,
    Offcanvas,
} from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Link, useLocation } from 'react-router-dom';
import LogoPNG from '@assets/logo.png';
import { useContext, useState } from 'react';
import SnippetContext from '../../contexts/SnippetContext';
import languages from '@objects/languages';
import { LanguageKeyType } from '@custom-types/languages';
import DashboardContext from '../../contexts/DashboardContext';

const Links = ({
    className,
    toggleMobileNavigation,
}: {
    className?: string;
    toggleMobileNavigation?: () => void;
}) => {
    const { uid } = useContext(DashboardContext);
    const { pathname } = useLocation();
    const { setLanguage, language, snippet } = useContext(SnippetContext);
    const { signOut } = useContext(DashboardContext);
    return (
        <Nav className={className}>
            <Link
                className={
                    pathname.indexOf('/request-aid') === 0 || pathname === '/'
                        ? 'active nav-link'
                        : 'nav-link'
                }
                to={'/request-aid'}
                onClick={toggleMobileNavigation}
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
                onClick={toggleMobileNavigation}
            >
                {snippet('donate', 'navigation')}
            </Link>
            <Link
                className={
                    pathname.indexOf('/events') === 0
                        ? 'active nav-link'
                        : 'nav-link'
                }
                to="/events"
                onClick={toggleMobileNavigation}
            >
                {snippet('events', 'navigation')}
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
                        onClick={toggleMobileNavigation}
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
                    onClick={toggleMobileNavigation}
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
                        onClick={toggleMobileNavigation}
                    >
                        {text}
                    </NavDropdown.Item>
                ))}
            </NavDropdown>
        </Nav>
    );
};

const Navigation: StyledComponent = styled(({ className }) => {
    const { snippet } = useContext(SnippetContext);
    const [isMobileNavigationOpen, setIsMobileNavigationOpen] =
        useState<boolean>(false);
    const toggleMobileNavigation = () =>
        setIsMobileNavigationOpen(!isMobileNavigationOpen);
    return (
        <Navbar
            bg="dark"
            variant="dark"
            sticky="top"
            className={`${className} animate__animated animate__slideInDown`}
            expand={false}
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
                <Links className="justify-content-end tablet-remove desktop-links" />
                <Navbar.Toggle
                    className="tablet-show"
                    aria-controls={`offcanvasNavbar-expand`}
                    onClick={toggleMobileNavigation}
                />
                <Navbar.Offcanvas
                    id={`offcanvasNavbar-expand`}
                    aria-labelledby={`offcanvasNavbarLabel-expand`}
                    placement="end"
                    show={isMobileNavigationOpen}
                    onHide={toggleMobileNavigation}
                >
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title id={`offcanvasNavbarLabel-expand`}>
                            <b>{snippet('communalists')}</b>
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Links
                            toggleMobileNavigation={toggleMobileNavigation}
                        />
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
})(style);

export default Navigation;
