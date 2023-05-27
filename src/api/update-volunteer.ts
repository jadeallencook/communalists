import { RoleKeyType } from '@custom-types/role';
import { getAuth } from 'firebase/auth';
import { updateDoc, doc, getFirestore } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);
const auth = getAuth();

const updateVolunteer = async (
    id: string,
    remove: boolean,
    key: RoleKeyType,
    collection: 'requests' | 'donations'
) => {
    const { uid } = auth.currentUser;
    const docRef = doc(db, collection, id);
    let object = {};
    if (key === 'driver') {
        object = {
            ...object,
            hasDriver: !remove,
        };
    }
    object = {
        ...object,
        [key]: remove ? '' : uid,
    };

    return updateDoc(docRef, object);
};

export default updateVolunteer;
