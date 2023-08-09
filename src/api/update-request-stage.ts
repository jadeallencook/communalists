import { RequestStageKeyType } from '@custom-types/stages';
import { updateDoc, doc, getFirestore } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const updateRequestStage = async (id: string, stage: RequestStageKeyType) => {
    const docRef = doc(db, 'requests', id);
    await updateDoc(docRef, { stage });
    return true;
};

export default updateRequestStage;
