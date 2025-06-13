import { Timestamp } from "firebase/firestore";

export interface UserProfile {
    id?: string;
    address: string;
    age: number;
    birthdate: Timestamp;
    userId: string;
}
