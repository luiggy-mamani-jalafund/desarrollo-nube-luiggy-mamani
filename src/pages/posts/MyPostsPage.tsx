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

export const MyPostsPage = () => {
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
                const fetchedPosts = await postRepository.getPostsByUser(
                    user.uid,
                );
                setPosts(fetchedPosts);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user posts:", error);
                setLoading(false);
            }
        };
        fetchPosts();
    }, [user, router, postRepository]);

    const handleDelete = async (postId: string) => {
        if (!user) return;
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
                <Card className="my-3" title="My Posts">
                    {posts.length === 0 ? (
                        <p>You haven't created any posts yet.</p>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="border-b py-2">
                                <p>{post.content}</p>
                                <p className="text-sm text-gray-500">
                                    Posted on:{" "}
                                    {post.date.toDate().toLocaleDateString()}
                                </p>
                                <Button
                                    variant="danger"
                                    className="mt-2"
                                    onClick={() =>
                                        post.id && handleDelete(post.id)
                                    }
                                >
                                    Delete
                                </Button>
                            </div>
                        ))
                    )}
                    <Button
                        variant="primary"
                        className="mt-3"
                        onClick={() => router.push("/posts/create")}
                    >
                        Create New Post
                    </Button>
                </Card>
            </Container>
        </>
    );
};
