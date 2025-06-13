"use client";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { UserProfileRepository } from "@/repositories/UserProfileRepository";
import { Timestamp } from "firebase/firestore";
import Menu from "@/components/Menu";
import { Container } from "@/components/Container";
import Card from "@/components/Card";
import { Input } from "@/components/Input";
import Button from "@/components/Button";

type Inputs = {
    address: string;
    age: number;
    birthdate: string;
};

export const AddProfileDataPage = () => {
    const router = useRouter();
    const { user } = useFirebaseUser();
    const userProfileRepository = new UserProfileRepository();
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>();

    useEffect(() => {
        if (!user) {
            return;
        }
        const checkProfile = async () => {
            try {
                const profile = await userProfileRepository.getUserProfile(
                    user.uid,
                );
                setHasProfile(!!profile);
                if (profile) {
                    router.push("/");
                }
            } catch (error) {
                console.error("Error checking user profile:", error);
            }
        };
        checkProfile();
    }, [user, router, userProfileRepository]);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        if (!user) return;
        try {
            await userProfileRepository.addUserProfile({
                address: data.address,
                age: data.age,
                birthdate: Timestamp.fromDate(new Date(data.birthdate)),
                userId: user.uid,
            });
            console.log("Profile data added successfully");
            router.push("/");
        } catch (error) {
            console.log("Error adding profile data:", error);
        }
    };

    if (hasProfile === null) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Menu />
            <Container>
                <Card className="my-3" title="Add Profile Data">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            label="Address"
                            type="text"
                            aria-invalid={errors.address ? "true" : "false"}
                            {...register("address", { required: true })}
                        />
                        {errors.address && <span>This field is required</span>}
                        <Input
                            label="Age"
                            type="number"
                            aria-invalid={errors.age ? "true" : "false"}
                            {...register("age", {
                                required: true,
                                valueAsNumber: true,
                            })}
                        />
                        {errors.age && <span>This field is required</span>}
                        <Input
                            label="Birthdate"
                            type="date"
                            aria-invalid={errors.birthdate ? "true" : "false"}
                            {...register("birthdate", { required: true })}
                        />
                        {errors.birthdate && (
                            <span>This field is required</span>
                        )}
                        <Button variant="primary" type="submit">
                            Save Profile Data
                        </Button>
                    </form>
                </Card>
            </Container>
        </>
    );
};
