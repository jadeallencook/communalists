import { StageKeyType } from '@custom-types/stages';

const getBadgeBgForStage = (stage: StageKeyType): string => {
    if (stage === ('unassigned' || 'in-process')) {
        return 'info';
    } else if (stage === ('contacted' || 'needs-driver' || 'driver-assigned')) {
        return 'warning';
    } else if (stage === ('completed' || 'questionable' || 'cant-contact')) {
        return 'success';
    }
    return 'primary';
};

export default getBadgeBgForStage;
