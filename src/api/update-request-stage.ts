import { StageKeyType } from '@custom-types/stages';
import { updateDoc, doc, getFirestore } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const updateRequestStage = async (id: string, stage: StageKeyType) => {
    const docRef = doc(db, 'requests', id);
    const response = await updateDoc(docRef, {
        stage,
    });
    return response;
};

export default updateRequestStage;
