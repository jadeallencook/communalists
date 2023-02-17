import { Container } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const Template: StyledComponent = styled(
    ({ className }: { className: string }) => (
        <Container className={className}>
            <h1>Template Component</h1>
        </Container>
    )
)(style);

export default Template;
