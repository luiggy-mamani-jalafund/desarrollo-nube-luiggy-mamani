import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
    GoogleAuthProvider,
    type User,
    signOut,
    linkWithCredential,
    PhoneAuthProvider,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { firebaseAuth } from "../firebase/FirebaseConfig";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import { useRouter } from "next/navigation";

export const useFirebaseUser = () => {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [userLoading, setUserLoading] = useState(true);
    useEffect(() => {
        if (user) {
            return;
        }
        onAuthStateChanged(firebaseAuth, (loggedInUser) => {
            setUserLoading(false);
            if (loggedInUser) {
                setUser(loggedInUser);
            }
        });
    }, [user]);
    const loginWithFirebase = (email: string, password: string) => {
        signInWithEmailAndPassword(firebaseAuth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User signed in:", user);
                router.push("/");
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log("Error signing in:", errorCode, errorMessage);
            });
    };
    const registerWithFirebase = (
        email: string,
        password: string,
        fullName: string,
    ) => {
        createUserWithEmailAndPassword(firebaseAuth, email, password)
            .then((userCredential) => {
                // Registered and Signed in
                const user = userCredential.user;

                console.log("User signed in:", user);
                updateProfile(user, {
                    displayName: fullName,
                })
                    .then(() => {
                        console.log("Profile updated successfully");
                        router.push("/");
                    })
                    .catch((error) => {
                        console.log("Error updating profile:", error);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log("Error signing in:", errorCode, errorMessage);
            });
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(firebaseAuth, provider)
            .then((result) => {
                GoogleAuthProvider.credentialFromResult(result);

                console.log("User signed in with Google:", result.user);
                router.push("/");
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential =
                    GoogleAuthProvider.credentialFromError(error);
                console.log("Error signing in with Google:", {
                    errorCode,
                    errorMessage,
                    email,
                    credential,
                });
            });
    };
    const logout = () => {
        signOut(firebaseAuth)
            .then(() => {
                console.log("User signed out successfully");
                setUser(null);
                router.push("/login");
            })
            .catch((error) => {
                console.log("Error signing out:", error);
            });
    };
    const linkWithPassword = (email: string, password: string) => {
        if (!user) {
            return;
        }
        const credential = EmailAuthProvider.credential(email, password);
        linkWithCredential(user, credential)
            .then((usercred) => {
                const user = usercred.user;
                console.log("Account linking success", user);
            })
            .catch((error) => {
                console.log("Account linking error", error);
            });
    };
    const linkWithPhone = async (
        verificationId: string,
        verificationCode: string,
    ) => {
        if (!user) {
            return false;
        }
        const credential = PhoneAuthProvider.credential(
            verificationId,
            verificationCode,
        );
        const userCred = await linkWithCredential(user, credential);
        if (!userCred) {
            console.log("Failed to link with phone");
            return false;
        }
        console.log("Account linking success", user);
        return true;
    };
    return {
        user,
        userLoading,
        loginWithFirebase,
        registerWithFirebase,
        loginWithGoogle,
        logout,
        linkWithPassword,
        linkWithPhone,
    };
};
