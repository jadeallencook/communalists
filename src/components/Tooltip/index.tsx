import { OverlayTrigger, Tooltip as RBTooltip } from "react-bootstrap"
import InfoSVG from '@assets/info.svg';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const InfoIcon = 
	<img
		src={InfoSVG}
		style={{
			cursor: 'pointer',
			animationDelay: '1s',
		}}
		className="animate__animated animate__tada"
	/>

const Tooltip: StyledComponent = styled(({
	className,
	position,
	element = InfoIcon,
	children
}: {
	className: string,
	position: "top" | "bottom" | "left" | "right",
	element?: JSX.Element,
	children: JSX.Element | string
}) => {
	return (
		<OverlayTrigger
			placement={position}
			overlay={
				<RBTooltip id={`tooltip-${position}`}>
					<div
						className={className}
					>
						{children}
					</div>
				</RBTooltip>
			}
		>
			{element}
		</OverlayTrigger>
	)
})(style)
export default Tooltip