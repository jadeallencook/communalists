import { getAuth } from 'firebase/auth';
import {
    getFirestore,
    updateDoc,
    doc,
    arrayUnion,
    getDoc,
    setDoc,
} from 'firebase/firestore';
import app from './init-app';
import CommentInterface from '@interfaces/comment';

const db = getFirestore(app);

const addComment = async (
    value: CommentInterface,
    id: string
): Promise<any> => {
    const {
        currentUser: { uid: user },
    } = getAuth(app);
    const docRef = doc(db, `threads/${id}`);
    const docSnap = await getDoc(docRef);
    const comment = { ...value, user };
    const data = {
        comments: arrayUnion(comment),
        lastModified: value.timestamp,
    };
    if (docSnap.exists()) {
        await updateDoc(docRef, data);
    } else {
        await setDoc(docRef, data);
    }
    return true;
};

export default addComment;
