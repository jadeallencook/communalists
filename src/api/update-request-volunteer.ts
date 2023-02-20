import { RoleKeyType } from '@custom-types/role';
import { getAuth } from 'firebase/auth';
import { updateDoc, doc, getFirestore } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);
const auth = getAuth();

const updateRequestVolunteer = async (
    id: string,
    remove: boolean,
    key: RoleKeyType
) => {
    const { uid } = auth.currentUser;
    const docRef = doc(db, 'requests', id);
    return await updateDoc(docRef, {
        [key]: remove ? '' : uid,
    })
        .then((response) => response)
        .catch((response) => response);
};

export default updateRequestVolunteer;
