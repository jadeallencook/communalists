import { getDatabase, ref, child, get } from 'firebase/database';

const dbRef = ref(getDatabase());

const getDisplayNames = async () =>
    await get(child(dbRef, 'displayNames')).then((snapshot) =>
        snapshot.exists() ? snapshot.val() : {}
    );

export default getDisplayNames;
