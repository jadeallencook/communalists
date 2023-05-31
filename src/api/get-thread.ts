import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from './init-app';
import ThreadInterface from '@interfaces/thread';

const db = getFirestore(app);

const getThread = async (id: string): Promise<ThreadInterface> => {
    const threadRef = doc(db, 'threads', id);
    const docSnap = await getDoc(threadRef);
    return docSnap.data() as ThreadInterface;
};

export default getThread;
