import { StageKeyType } from '@custom-types/stages';

const primaryStages = new Set(['unassigned', 'in-process']);
const secondaryStages = new Set([
    'contacted',
    'needs-driver',
    'driver-assigned',
]);
const successStages = new Set(['completed']);
const dangerStages = new Set(['cancelled', 'questionable', 'cant-contact']);

const getBadgeBgForStage = (stage: StageKeyType): string => {
    if (primaryStages.has(stage)) {
        return 'primary';
    }
    if (secondaryStages.has(stage)) {
        return 'secondary';
    }
    if (successStages.has(stage)) {
        return 'success';
    }
    if (dangerStages.has(stage)) {
        return 'danger';
    }
    return 'info';
};

export default getBadgeBgForStage;
