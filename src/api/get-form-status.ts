import { child, get, getDatabase, ref } from 'firebase/database';

const dbRef = ref(getDatabase());

const getFormStatus = async (): Promise<boolean> => {
    try {
        return await get(child(dbRef, 'requestFormStatus')).then((snapshot) =>
            snapshot.exists() ? snapshot.val() : false
        );
    } catch (err) {
        console.log(err);
        return null;
    }
};

export default getFormStatus;
