"use client";

import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import Menu from "../components/Menu";
import { useFirebaseUser } from "../hooks/useFirebaseUser";
import { firebaseAuth } from "../firebase/FirebaseConfig";
import {
    PhoneAuthProvider,
    RecaptchaVerifier,
    type ConfirmationResult,
} from "firebase/auth";
import { useRouter } from "next/navigation";

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
        recaptchaWidgetId?: number;
        confirmationResult?: ConfirmationResult;
    }
}

const PhoneCheckPage = () => {
    const router = useRouter();
    const { user, userLoading, linkWithPhone } = useFirebaseUser();
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [codeVerification, setCodeVerification] = useState<string>("");
    const [showCode, setShowCode] = useState<boolean>(false);
    const phoneRef = useRef<string>("");
    const [verificationId, setVerificationId] = useState<string>("");
    useEffect(() => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                firebaseAuth,
                "sign-in-button",
                {
                    size: "invisible",
                    callback: () => {
                        onSignInSubmit();
                    },
                },
            );
            window.recaptchaVerifier.render().then((widgetId) => {
                window.recaptchaWidgetId = widgetId;
            });
        }
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = undefined;
            }
        };
    }, []);
    const onSignInSubmit = () => {
        const appVerifier = window.recaptchaVerifier;
        if (!phoneRef.current) {
            console.log("Phone number is required.");
            return;
        }
        const provider = new PhoneAuthProvider(firebaseAuth);
        provider
            .verifyPhoneNumber(phoneRef.current, appVerifier)
            .then((id) => {
                setVerificationId(id);
                setShowCode(true);
            })
            .catch((error) => {
                console.log("Error during verifyPhoneNumber:", error);
            });
    };
    const verifyCode = async () => {
        if (!verificationId || !codeVerification) {
            console.log("Verification ID and code are required.");
            return;
        }
        const result = await linkWithPhone(verificationId, codeVerification);
        console.log("Link with phone result:", result);
        if (result) {
            router.push("/");
        }
    };
    useEffect(() => {
        if (!userLoading && !user) {
            router.push("/login");
        }
    }, [user, userLoading]);
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (showCode) {
            verifyCode();
        } else {
            phoneRef.current = phoneNumber;
            document.getElementById("sign-in-button")?.click();
        }
    };
    return (
        <>
            <Menu />
            <Container>
                <Card className="my-3" title="Add phone number">
                    <form onSubmit={onSubmit}>
                        <div>
                            <Input
                                label="Phone number"
                                type="text"
                                onChange={(e) => {
                                    setPhoneNumber(e.target.value);
                                }}
                                value={phoneNumber}
                            />
                            {!phoneNumber && (
                                <span>This field is required</span>
                            )}
                        </div>
                        {showCode && (
                            <div>
                                <Input
                                    label="Code Verification"
                                    type="text"
                                    maxLength={6}
                                    onChange={(e) => {
                                        setCodeVerification(e.target.value);
                                    }}
                                    value={codeVerification}
                                />
                                {!codeVerification && (
                                    <span>This field is required</span>
                                )}
                            </div>
                        )}

                        <div>
                            <Button type="submit" variant="primary">
                                Verify Phone Number
                            </Button>
                            <button className="hidden" id="sign-in-button">
                                Real verificaiton
                            </button>
                        </div>
                    </form>
                </Card>
            </Container>
        </>
    );
};

export default PhoneCheckPage;
