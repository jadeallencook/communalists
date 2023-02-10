import { StageType, StageKeyType } from '@custom-types/stages';

const stages: { [key in StageKeyType]: StageType } = {
	submitted: 'Submitted',
	started: 'Started',
	ready: 'Ready',
	complete: 'Complete',
};

export default stages;
