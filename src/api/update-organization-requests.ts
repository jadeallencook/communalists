import {
    updateDoc,
    doc,
    getFirestore,
    arrayUnion,
    arrayRemove,
} from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const updateOrganizationRequests = async (
    userUID: string,
    organizationUID: string,
    state: 'requests' | 'members' | 'moderators'
) => {
    const docRef = doc(db, 'organizations', organizationUID);
    if (state === 'members') {
        await updateDoc(docRef, {
            [state]: arrayUnion(userUID),
            requests: arrayRemove(userUID),
        });
    } else if (state === 'requests') {
        await updateDoc(docRef, {
            [state]: arrayUnion(userUID),
        });
    }
    return true;
};

export default updateOrganizationRequests;
