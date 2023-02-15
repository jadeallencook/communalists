import { useContext } from 'react';
import { Container } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import SnippetContext from '../../contexts/SnippetContext';
import style from './style';

const Footer: StyledComponent = styled(({ className }) => {
    const { snippet } = useContext(SnippetContext);
    return (
        <Container
            fluid
            className={`${className} animate__animated animate__fadeIn`}
        >
            {snippet('line1', 'footer')}
            <br />
            <b>{snippet('line2', 'footer')}</b>
            <br />
            {snippet('line3', 'footer')}
            <br />
            <a
                href="https://github.com/jadeallencook/communalists"
                target="_blank"
            >
                {snippet('link', 'footer')}
            </a>
        </Container>
    );
})(style);

export default Footer;
