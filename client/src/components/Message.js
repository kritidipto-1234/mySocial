import React, { useContext } from "react";
import { MessageContext } from "../contextStore/messageContext";
import styles from "./css/Message.module.scss";

function Message(props) {
    const msgContext = useContext(MessageContext);

    const className =
        styles.Message +
        " " +
        (msgContext.isErrorMessage
            ? styles.errorMessage
            : styles.normalMessage);

    return (
        <div className={className}>
            <button
                onClick={msgContext.closeMessage}
                className={styles.CloseBtn}
            >
                X
            </button>
            {msgContext.message}
        </div>
    );
}

export default Message;
