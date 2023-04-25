import { Container, Spinner } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const Loading: StyledComponent = styled(
    ({ className }: { className: string }) => (
        <Container className={className}>
            <Spinner animation="border" />
        </Container>
    )
)(style);

export default Loading;
