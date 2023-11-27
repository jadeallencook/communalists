import { getDatabase, ref, set } from 'firebase/database';

const updateFormStatus = async (status: boolean) => {
    const db = getDatabase();
    return await set(ref(db, 'requestFormStatus'), status);
};

export default updateFormStatus;
