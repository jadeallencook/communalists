import { Tooltip as RBTooltip } from "react-bootstrap"

const Tooltip = ( props ) => {

	const { children } = props

	return (
		<RBTooltip {...props}>
			<div
				style={{
					textAlign: 'left',
					padding: '10px',
				}}
			>
				{children}
			</div>
		</RBTooltip>
	)
}
export default Tooltip