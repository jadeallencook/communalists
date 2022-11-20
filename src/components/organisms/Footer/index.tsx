import { Container } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const Footer: StyledComponent = styled(({ className }) => {
	return (
		<Container fluid className={className}>
			Developed by Volunteers
			<br />
			<b>San Francisco Bay Area</b>
			<br />
			Established 2022
			<br />
			<a
				href="https://github.com/jadeallencook/communalists"
				target="_blank"
			>
				Open Source
			</a>
		</Container>
	);
})(style);

export default Footer;
