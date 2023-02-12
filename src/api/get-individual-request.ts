import RequestAidInterface from '@interfaces/request-aid';
import {
    getFirestore,
    collection,
    getDocs,
    query, 
    where,
    doc,
    getDoc,
    DocumentSnapshot,
} from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getIndividualRequest = async (
    uid: string
)=> {
    try{     
        const docRef = doc(db, "requests", uid)
        const docSnap = await getDoc(docRef);
        return docSnap.data() as RequestAidInterface;
    } catch(err){
        console.log(err)
        return null
    }
};

export default getIndividualRequest;
