import { firebaseDb } from "@/firebase/FirebaseConfig";
import { Post } from "@/pages/models/Post";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
} from "firebase/firestore";

export class PostRepository {
    collectionName = "posts";

    async addPost(post: Post): Promise<Post> {
        try {
            if (post.id) {
                delete post.id;
            }
            const docRef = await addDoc(
                collection(firebaseDb, this.collectionName),
                {
                    ...post,
                },
            );
            console.log("Post written with ID: ", docRef.id);
            return {
                ...post,
                id: docRef.id,
            };
        } catch (e) {
            console.error("Error adding post: ", e);
            throw e;
        }
    }

    async getAllPosts(): Promise<Post[]> {
        try {
            const querySnapshot = await getDocs(
                collection(firebaseDb, this.collectionName),
            );
            const posts: Post[] = [];
            querySnapshot.forEach((doc) => {
                posts.push({ id: doc.id, ...doc.data() } as Post);
            });
            return posts;
        } catch (e) {
            console.error("Error fetching posts: ", e);
            throw e;
        }
    }

    async getPostsByUser(userId: string): Promise<Post[]> {
        try {
            const q = query(
                collection(firebaseDb, this.collectionName),
                where("userId", "==", userId),
            );
            const querySnapshot = await getDocs(q);
            const posts: Post[] = [];
            querySnapshot.forEach((doc) => {
                posts.push({ id: doc.id, ...doc.data() } as Post);
            });
            return posts;
        } catch (e) {
            console.error("Error fetching user posts: ", e);
            throw e;
        }
    }

    async deletePost(postId: string): Promise<void> {
        try {
            await deleteDoc(doc(firebaseDb, this.collectionName, postId));
            console.log("Post deleted with ID: ", postId);
        } catch (e) {
            console.error("Error deleting post: ", e);
            throw e;
        }
    }
}
