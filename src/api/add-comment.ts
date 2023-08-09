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
import { FeatureType } from '@custom-types/feature';

const db = getFirestore(app);

const addComment = async (
    value: CommentInterface,
    id: string,
    organization: string,
    type: FeatureType
): Promise<any> => {
    const {
        currentUser: { uid: user },
    } = getAuth(app);
    const path = `organizations/${organization}/${type}_threads/${id}`;
    const docRef = doc(db, path);
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
