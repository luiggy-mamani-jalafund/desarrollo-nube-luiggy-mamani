"use client";
import Button from "../../components/Button";
import { useFirebaseUser } from "../../hooks/useFirebaseUser";
import Card from "../../components/Card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfileRepository } from "@/repositories/UserProfileRepository";
import { UserProfile } from "../models/UserProfile";

export const LoggedInUser = () => {
    const router = useRouter();
    const { user, logout } = useFirebaseUser();
    const userProfileRepository = new UserProfileRepository();
    const [userHasGoogle, setUserHasGoogle] = useState(false);
    const [userHasPassword, setUserHasPassword] = useState(false);
    const [userHasPhone, setUserHasPhone] = useState(false);
    const [userProfile, setUserProfile] = useState<
        UserProfile | null | undefined
    >(null);

    useEffect(() => {
        if (!user) {
            return;
        }
        // Check authentication providers
        const hasGoogle = user.providerData.some(
            (profile) => profile.providerId === "google.com",
        );
        setUserHasGoogle(hasGoogle);
        const hasPassword = user.providerData.some(
            (profile) => profile.providerId === "password",
        );
        setUserHasPassword(hasPassword);
        const hasPhone = user.providerData.some(
            (profile) => profile.providerId === "phone",
        );
        setUserHasPhone(hasPhone);

        const fetchProfile = async () => {
            try {
                const profile = await userProfileRepository.getUserProfile(
                    user.uid,
                );
                if (!profile) {
                    setUserProfile(undefined);
                } else {
                    setUserProfile(profile);
                }
            } catch (error) {
                console.log("Error fetching user profile:", error);
            }
        };
        fetchProfile();
    }, [user, router, userProfileRepository]);

    const onAddEmailSignInClicked = () => {
        router.push("/linkpassword");
    };

    const onAddPhoneSignInClicked = () => {
        router.push("/phonecheck");
    };

    const onAddProfileDataClicked = () => {
        router.push("/add-profile-data");
    };

    return (
        <>
            <Card>
                <div>
                    <h1>Welcome to the dashboard {user?.displayName}!</h1>
                    <div>
                        <b>Your email is:</b> {user?.email}
                    </div>
                    {userProfile === null && <span>Login profile data ...</span>}
                    {userProfile && (
                        <div>
                            <div>
                                <b>Address:</b> {userProfile.address}
                            </div>
                            <div>
                                <b>Age:</b> {userProfile.age}
                            </div>
                            <div>
                                <b>Birthdate:</b>{" "}
                                {userProfile.birthdate
                                    .toDate()
                                    .toLocaleDateString()}
                            </div>
                        </div>
                    )}
                    <div>
                        Add additional login methods:
                        {!userHasGoogle && (
                            <div>
                                <Button
                                    variant="danger"
                                    className="mt-3"
                                    onClick={() => {}}
                                >
                                    Add google Sign In
                                </Button>
                            </div>
                        )}
                        {!userHasPassword && (
                            <div>
                                <Button
                                    variant="secondary"
                                    className="mt-3"
                                    onClick={onAddEmailSignInClicked}
                                >
                                    Add email Sign In
                                </Button>
                            </div>
                        )}
                        {!userHasPhone && (
                            <div>
                                <Button
                                    variant="secondary"
                                    className="mt-3"
                                    onClick={onAddPhoneSignInClicked}
                                >
                                    Add Phone details
                                </Button>
                            </div>
                        )}
                        {userProfile !== null && userProfile === undefined && (
                            <div>
                                <Button
                                    variant="primary"
                                    className="mt-3"
                                    onClick={onAddProfileDataClicked}
                                >
                                    Add Profile Data
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <Button
                        variant="primary"
                        className="mt-3"
                        onClick={() => {
                            logout();
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </Card>
        </>
    );
};
