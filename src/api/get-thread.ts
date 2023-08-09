import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from './init-app';
import ThreadInterface from '@interfaces/thread';
import { FeatureType } from '@custom-types/feature';

const db = getFirestore(app);

const getThread = async (
    organization: string,
    id: string,
    type: FeatureType
): Promise<ThreadInterface> => {
    const path = `organizations/${organization}/${type}_threads`;
    const threadRef = doc(db, path, id);
    const docSnap = await getDoc(threadRef);
    return docSnap.data() as ThreadInterface;
};

export default getThread;
