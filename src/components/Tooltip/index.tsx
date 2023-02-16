import { OverlayTrigger, Tooltip as RBTooltip } from "react-bootstrap"
import InfoSVG from '@assets/info.svg';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const Tooltip: StyledComponent = styled(({
	className,
	position,
	iconSrc = InfoSVG,
	children
}: {
	className: string,
	position: "top" | "bottom" | "left" | "right",
	iconSrc?: string,
	children: JSX.Element | string
}) => {
	return (
		<span className={className}>
			<OverlayTrigger
				placement={position}
				overlay={
					<RBTooltip id={`tooltip-${position}`}>
						{children}
					</RBTooltip>
				}
			>
				<img
					src={iconSrc}
					className="animate__animated animate__tada"
				/>
			</OverlayTrigger>
		</span>
	)
})(style)
export default Tooltip