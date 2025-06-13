import { addDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { firebaseDb } from "../firebase/FirebaseConfig";

export interface UserProfile {
    id?: string;
    address: string;
    age: number;
    birthdate: Timestamp;
    userId: string;
}

export class UserProfileRepository {
    collectionName = "userProfiles";

    async addUserProfile(profile: UserProfile): Promise<UserProfile> {
        try {
            if (profile.id) {
                delete profile.id;
            }
            const docRef = await addDoc(collection(firebaseDb, this.collectionName), {
                ...profile,
            });
            console.log("User profile written with ID: ", docRef.id);
            return {
                ...profile,
                id: docRef.id,
            };
        } catch (e) {
            console.error("Error adding user profile: ", e);
            throw e;
        }
    }

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const q = query(
                collection(firebaseDb, this.collectionName),
                where("userId", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return { id: doc.id, ...doc.data() } as UserProfile;
            }
            return null;
        } catch (e) {
            console.error("Error fetching user profile: ", e);
            throw e;
        }
    }
}