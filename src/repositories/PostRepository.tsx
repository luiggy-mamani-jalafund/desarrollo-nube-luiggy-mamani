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
import { ImageRepository } from "./ImageRepository";

export class PostRepository {
    collectionName = "posts";
    imageRepository: ImageRepository;

    constructor(imageRepository: ImageRepository) {
        this.imageRepository = imageRepository;
    }

    async addPost(post: Post, image?: File | Blob): Promise<Post> {
        try {
            let imageUrl: string | undefined;
            if (image) {
                imageUrl = await toast.promise(
                    this.imageRepository.uploadStagedFile(image),
                    {
                        pending: "Uploading image",
                        error: "Something bad happened during the image uploading process",
                        success: "Uploaded",
                    },
                );
            }

            if (post.id) {
                delete post.id;
            }

            const docRef = await toast.promise(
                addDoc(collection(firebaseDb, this.collectionName), {
                    ...post,
                    imageUrl,
                }),
                {
                    pending: "Crating post",
                    error: "Something bad happened",
                    success: "Created",
                },
            );

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
