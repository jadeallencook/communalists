import { Container, Spinner } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const Loading: StyledComponent = styled(({ className, text }) => {
	return (
		<Container fluid className={className}>
			<Spinner animation="border" variant="light" />
		</Container>
	);
})(style);

export default Loading;
