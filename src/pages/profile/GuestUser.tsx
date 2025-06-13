"use client";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";

export const GuestUser = () => {
    const router = useRouter();
    return (
        <>
            <h1>Please sign in to continue</h1>
            <Button
                variant="primary"
                className="mt-3"
                onClick={() => {
                    router.push("/login");
                }}
            >
                Login
            </Button>
        </>
    );
};
