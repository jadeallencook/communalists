import { Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { FeatureType } from '@custom-types/feature';
import { ACTION_STAGES, REQUEST_STAGES } from '@objects/stages';
import { AnyStageKeyType } from '@custom-types/stages';
import { useContext, useEffect, useState } from 'react';
import API from '@api/index';
import DashboardContext from '../../contexts/DashboardContext';

interface Props {
    className: string;
    type: FeatureType;
    organization: string;
    id: string;
    currentStage: AnyStageKeyType;
}

const StageManager: StyledComponent = styled(
    ({ className, type, organization, id, currentStage }: Props) => {
        const { updateStage, isLoading } = useContext(DashboardContext);
        const STAGES = type === 'request' ? REQUEST_STAGES : ACTION_STAGES;
        const [stage, setStage] = useState<AnyStageKeyType>(currentStage);
        useEffect(() => {
            updateStage(id, stage, organization, type);
        }, [stage]);
        return (
            <Form.Group className={`${className} mb-3`}>
                <Form.Label>Current Stage</Form.Label>
                <Form.Select
                    disabled={isLoading}
                    defaultValue={stage}
                    onChange={(event) =>
                        setStage(event.target.value as AnyStageKeyType)
                    }
                >
                    {Object.entries(STAGES).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
        );
    }
)(style);

export default StageManager;
