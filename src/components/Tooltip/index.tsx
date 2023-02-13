import { OverlayTrigger, Tooltip as RBTooltip } from "react-bootstrap"
import InfoSVG from '@assets/info.svg';

const InfoIcon = 
	<img
		src={InfoSVG}
		style={{
			cursor: 'pointer',
			animationDelay: '1s',
		}}
		className="animate__animated animate__tada"
	/>

const Tooltip = ({
	position,
	textDiv,
	children = InfoIcon
}: {
	position: "top" | "bottom" | "left" | "right",
	textDiv: any,
	children?: any
}) => {


	return (
		<OverlayTrigger
			placement={position}
			overlay={
				<RBTooltip id={`tooltip-${position}`}>
					<div
						style={{
							textAlign: 'left',
							padding: '10px',
						}}
					>
						{textDiv}
					</div>
				</RBTooltip>
			}
		>
			{children}
		</OverlayTrigger>
	)
}
export default Tooltip