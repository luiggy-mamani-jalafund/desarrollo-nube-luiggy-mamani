import { Timestamp } from "firebase/firestore";

export interface Post {
    id?: string;
    date: Timestamp;
    content: string;
    userId: string;
}
