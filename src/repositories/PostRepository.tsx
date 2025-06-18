import { firebaseDb } from "@/firebase/FirebaseConfig";
import { Post } from "@/pages/models/Post";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { v2 as cloudinary } from "cloudinary";

export class PostRepository {
    collectionName = "posts";

    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append("image", file);

        const response = await toast.promise(
            fetch("/api/upload-image", {
                method: "POST",
                body: formData,
            }),
            {
                pending: "Uploading image",
                error: "Failed to upload image",
                success: "Uploaded",
            },
        );

        if (!response.ok) {
            throw new Error("Failed to upload image");
        }

        const data = await response.json();
        return data.imageUrl;
    }

    async addPost(post: Post, image?: File): Promise<Post> {
        try {
            let imageUrl: string | undefined;
            if (image) {
                imageUrl = await this.uploadImage(image);
            }

            if (post.id) {
                delete post.id;
            }

            const docRef = await addDoc(
                collection(firebaseDb, this.collectionName),
                {
                    ...post,
                    imageUrl,
                },
            );

            console.log("Post written with ID: ", docRef.id);
            return {
                ...post,
                id: docRef.id,
                imageUrl,
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
            const postRef = doc(firebaseDb, this.collectionName, postId);
            const postSnap = await getDoc(postRef);
            if (postSnap.exists() && postSnap.data().imageUrl) {
                const imageUrl = postSnap.data().imageUrl;
                const publicId = imageUrl.match(/\/posts\/(.+)\.\w+$/)?.[1];
                if (publicId) {
                    await cloudinary.uploader.destroy(`posts/${publicId}`);
                }
            }

            await deleteDoc(postRef);
            console.log("Post deleted with ID: ", postId);
        } catch (e) {
            console.error("Error deleting post: ", e);
            throw e;
        }
    }
}
