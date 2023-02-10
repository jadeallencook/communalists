import { StageKeyType } from '@custom-types/stages';

const getBadgeBgForStage = (stage: StageKeyType): string => {
    if (stage === 'started') {
        return 'primary';
    } else if (stage === 'ready') {
        return 'warning';
    } else if (stage === 'complete') {
        return 'success';
    }
    return 'secondary';
};

export default getBadgeBgForStage;
