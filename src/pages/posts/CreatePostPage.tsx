"use client";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Timestamp } from "firebase/firestore";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { PostRepository } from "@/repositories/PostRepository";
import Menu from "@/components/Menu";
import { Container } from "@/components/Container";
import Card from "@/components/Card";
import { Input } from "@/components/Input";
import Button from "@/components/Button";

type Inputs = {
    content: string;
};

export const CreatePostPage = () => {
    const router = useRouter();
    const { user } = useFirebaseUser();
    const postRepository = new PostRepository();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>();

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        if (!user) return;
        try {
            await postRepository.addPost({
                content: data.content,
                date: Timestamp.now(),
                userId: user.uid,
            });
            console.log("Post created successfully");
            router.push("/posts/userposts");
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Menu />
            <Container>
                <Card className="my-3" title="Create Post">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            label="Content"
                            type="textarea"
                            aria-invalid={errors.content ? "true" : "false"}
                            {...register("content", { required: true })}
                        />
                        {errors.content && <span>This field is required</span>}
                        <Button variant="primary" type="submit">
                            Create Post
                        </Button>
                    </form>
                </Card>
            </Container>
        </>
    );
};
