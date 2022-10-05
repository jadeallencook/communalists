import { Container } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const Footer: StyledComponent = styled(({ className }) => {
	return (
		<Container fluid className={className}>
			Developed by Volunteers<br />
			<b>San Jose, CA</b>
		</Container>
	);
})(style);

export default Footer;
