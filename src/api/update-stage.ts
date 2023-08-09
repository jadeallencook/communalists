import { AnyStageKeyType } from '@custom-types/stages';
import { updateDoc, doc, getFirestore } from 'firebase/firestore';
import app from './init-app';
import { FeatureType } from '@custom-types/feature';

const db = getFirestore(app);

const updateStage = async (
    id: string,
    stage: AnyStageKeyType,
    organization: string,
    type: FeatureType
) => {
    const path = `organizations/${organization}/${type}s`;
    const docRef = doc(db, path, id);
    await updateDoc(docRef, { stage });
    return true;
};

export default updateStage;
