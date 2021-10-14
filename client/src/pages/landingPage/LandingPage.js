import React, { useContext, useEffect, useState } from "react";
import styles from "./css/LandingPage.module.scss";
import axios from "axios";
import config from "../../config";
import { useHistory } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { actions } from "../../reduxStore/index";
import { AppContext } from "../../contextStore/appContext";
import { MessageContext } from "../../contextStore/messageContext";

function LandingPage() {
    const dispatch = useDispatch();
    const emailInputRef = React.useRef();
    const passwordInputRef = React.useRef();
    const passwordConfirmInputRef = React.useRef();
    const nameInputRef = React.useRef();
    const descriptionInputRef = React.useRef();
    const history = useHistory();
    const messageCtx = useContext(MessageContext);
    const currentUser = useSelector(
        (state) => state.user.currentUser,
        shallowEqual
    );
    const [formType, setFormType] = useState("login");

    function initializeUserSession(data) {
        dispatch({
            type: actions.LOGIN_USER,
            user: { ...data.user },
            jwtToken: data.jwtToken,
        });
        history.replace("/conversations");
    }

    useEffect(() => {
        // if auto login succesfull redirect
        if (currentUser) history.replace("/conversations");
    }, [currentUser, history]);

    const loginHandler = async (e) => {
        try {
            e.preventDefault();

            const res = await axios({
                withCredentials: true,
                method: "POST",
                url: `${config.url}/api/users/signIn`,
                data: {
                    email: emailInputRef.current.value,
                    password: passwordInputRef.current.value,
                },
            });

            if (res.data.status === "success") {
                initializeUserSession(res.data);
                messageCtx.displayMessage("Welcome back");
            } else throw new Error(res);
        } catch (e) {
            messageCtx.displayMessage(e.response.data.message, true);
        }
    };

    const signUpHandler = async (e) => {
        try {
            e.preventDefault();

            const res = await axios({
                withCredentials: true,
                method: "POST",
                url: `${config.url}/api/users/signUp`,
                data: {
                    email: emailInputRef.current.value,
                    name: nameInputRef.current.value,
                    description: descriptionInputRef.current.value,
                    password: passwordInputRef.current.value,
                    passwordConfirm: passwordConfirmInputRef.current.value,
                },
            });

            if (res.data.status === "success") {
                initializeUserSession(res.data);
                messageCtx.displayMessage("Welcome to your account");
            } else throw new Error(res);
        } catch (e) {
            messageCtx.displayMessage(e.response.data.message, true);
        }
    };

    const forgotPasswordHandler = async (e) => {
        try {
            e.preventDefault();

            const res = await axios({
                withCredentials: true,
                method: "POST",
                url: `${config.url}/api/users/forgotPassword`,
                data: {
                    email: emailInputRef.current.value,
                },
            });

            if (res.data.status === "success") {
                messageCtx.displayMessage("Reset password mail send");
            } else throw new Error(res);
        } catch (e) {
            messageCtx.displayMessage(e.response.data.message, true);
        }
    };

    return (
        <div className={styles.LandingPage}>
            <div className={styles.container}>
                {formType === "login" && (
                    <form onSubmit={loginHandler}>
                        <input ref={emailInputRef} placeholder="Email" />
                        <input
                            ref={passwordInputRef}
                            placeholder="Password"
                            type="password"
                        />
                        <button type="submit">Login</button>
                    </form>
                )}
                {formType === "signUp" && (
                    <form onSubmit={signUpHandler}>
                        <input ref={emailInputRef} placeholder="Email" />
                        <input ref={nameInputRef} placeholder="Name" />
                        <input
                            ref={descriptionInputRef}
                            placeholder="Description"
                        />
                        <input
                            ref={passwordInputRef}
                            placeholder="Password"
                            type="password"
                        />
                        <input
                            ref={passwordConfirmInputRef}
                            placeholder="Password Confirm"
                            type="password"
                        />
                        <button type="submit">Create Account</button>
                    </form>
                )}
                {formType === "forgotPassword" && (
                    <form onSubmit={forgotPasswordHandler}>
                        <input ref={emailInputRef} placeholder="Email" />
                        <button type="submit">Send Reset Email</button>
                    </form>
                )}
                <div className={styles.buttonContainer}>
                    {formType !== "login" && (
                        <button onClick={() => setFormType("login")}>
                            Login
                        </button>
                    )}
                    {formType !== "signUp" && (
                        <button onClick={() => setFormType("signUp")}>
                            SignUp
                        </button>
                    )}
                    {formType !== "forgotPassword" && (
                        <button onClick={() => setFormType("forgotPassword")}>
                            Forgot Password
                        </button>
                    )}
                </div>
            </div>
            <div className={styles.iconCredits}>
                Icons made by{" "}
                <a
                    href="https://www.flaticon.com/authors/becris"
                    title="Becris"
                >
                    Becris
                </a>{" "}
                ,
                <a href="https://www.freepik.com" title="Freepik">
                    Freepik
                </a>
                from{" "}
                <a href="https://www.flaticon.com/" title="Flaticon">
                    www.flaticon.com
                </a>
            </div>
        </div>
    );
}

export default LandingPage;
