"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { PostRepository } from "@/repositories/PostRepository";
import { Post } from "../models/Post";
import Menu from "@/components/Menu";
import { Container } from "@/components/Container";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Link from "next/link";

export const AllPostsPage = () => {
    const router = useRouter();
    const { user } = useFirebaseUser();
    const postRepository = new PostRepository();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            return;
        }
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await postRepository.getAllPosts();
                setPosts(fetchedPosts);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching posts:", error);
                setLoading(false);
            }
        };
        fetchPosts();
    }, [user, router, postRepository]);

    const handleDelete = async (postId: string, postUserId: string) => {
        if (!user || user.uid !== postUserId) {
            console.error("Unauthorized to delete this post");
            return;
        }
        try {
            await postRepository.deletePost(postId);
            setPosts(posts.filter((post) => post.id !== postId));
            console.log("Post deleted successfully");
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Menu />
            <Container>
                <div className="flex justify-end mt-6">
                    <Link
                        href="/posts/userposts"
                        className="bg-blue-800 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
                    >
                        My Posts
                    </Link>
                </div>
                <Card className="my-3" title="All Posts">
                    {posts.length === 0 ? (
                        <p>No posts available.</p>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="border-b py-2">
                                <p>{post.content}</p>
                                <p className="text-sm text-gray-500">
                                    Posted on:{" "}
                                    {post.date.toDate().toLocaleDateString()}
                                </p>
                                {user?.uid === post.userId && (
                                    <Button
                                        variant="danger"
                                        className="mt-2"
                                        onClick={() =>
                                            post.id &&
                                            handleDelete(post.id, post.userId)
                                        }
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </Card>
            </Container>
        </>
    );
};
