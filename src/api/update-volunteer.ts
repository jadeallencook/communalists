import { RoleKeyType } from '@custom-types/role';
import { getAuth } from 'firebase/auth';
import { updateDoc, doc, getFirestore } from 'firebase/firestore';
import app from './init-app';
import { FeatureType } from '@custom-types/feature';

const db = getFirestore(app);
const auth = getAuth();

const updateVolunteer = async (
    id: string,
    remove: boolean,
    role: RoleKeyType,
    type: FeatureType,
    organization: string
) => {
    const { uid } = auth.currentUser;
    const path = `organizations/${organization}/${type}s/${id}`;
    const docRef = doc(db, path);
    const value = { [role]: remove ? '' : uid };
    return await updateDoc(docRef, value)
        .then((response) => response)
        .catch((response) => response);
};

export default updateVolunteer;
