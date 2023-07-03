import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Container } from 'react-bootstrap';
import NetworkPNG from '@assets/network.png';

interface HeaderProps {
    className?: string;
    background?: string;
    children?: React.ReactNode;
}

const Header: StyledComponent = styled(
    ({ className, background, children }: HeaderProps) => (
        <div
            className={className}
            style={{
                backgroundImage: background ? `url(${background})` : 'none',
            }}
        >
            <Container>{children}</Container>
        </div>
    )
)(style);

Header.defaultProps = {
    background: NetworkPNG,
};

export default Header;
