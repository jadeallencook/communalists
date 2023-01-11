import { ButtonGroup, Container, Spinner, ToggleButton } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

interface ToggleButtonGroupInterface {
    className: string,
    radios: any[],
    state: string,
    handleSetState: React.SetStateAction<any>
}

const ToggleButtonGroup: StyledComponent = styled(({ 
    className, 
    radios, 
    state, 
    handleSetState 
} : ToggleButtonGroupInterface) => {
	return (
        <ButtonGroup className={className}>
            {radios.map((radio, idx: number) => (
                <ToggleButton
                    key={idx}
                    id={`radio-${idx}`}
                    type="radio"
                    className={`toggle ${idx.toString() === state ? 'active': ''}`}
                    name="radio"
                    value={radio.value}
                    checked={state === radio.value}
                    onChange={(e) => handleSetState(e.currentTarget.value)}
                >
                    {radio.name}
                </ToggleButton>
            ))}
        </ButtonGroup>
	);
})(style);

export default ToggleButtonGroup;
