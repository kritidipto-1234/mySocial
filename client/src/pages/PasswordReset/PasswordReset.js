import axios from "axios";
import React, { useContext, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import config from "../../config";
import { MessageContext } from "../../contextStore/messageContext";
import styles from "./css/PasswordReset.module.scss";

function PasswordReset(props) {
    const newPasswordRef = useRef();
    const newPasswordConfirmRef = useRef();

    const history = useHistory();

    const params = useParams();
    const messageCtx = useContext(MessageContext);

    const submitNewPassword = async (e) => {
        try {
            e.preventDefault();

            const res = await axios({
                withCredentials: true,
                method: "PATCH",
                url: `${config.url}/api/users/resetPassword/${params.passwordResetToken}`,
                data: {
                    password: newPasswordRef.current.value,
                    passwordConfirm: newPasswordConfirmRef.current.value,
                },
            });

            if (res.data.status === "success") {
                messageCtx.displayMessage("Password Successfully changed ");
                history.replace("/");
            }
        } catch (e) {
            messageCtx.displayMessage(e.response.data.message, true);
        }
    };

    return (
        <div className={styles.PasswordReset}>
            <form onSubmit={submitNewPassword}>
                <b>Password Reset</b>
                <input ref={newPasswordRef} placeholder="New Password" />
                <input
                    ref={newPasswordConfirmRef}
                    placeholder="New Password Confirm"
                />
                <button>Reset Paassword</button>
            </form>
        </div>
    );
}

export default PasswordReset;
