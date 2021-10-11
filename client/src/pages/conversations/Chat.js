import React from "react";
import styles from "./css/Chat.module.scss";
import { useSelector } from "react-redux";

function Chat(props) {
    let align, sender;
    const user = useSelector((state) => state.user.currentUser);

    if (user._id === props.chat.sender) {
        sender = "Me";
        align = "me";
    } else {
        sender = props.otherUser.name;
        align = "other";
    }

    const d = new Date(props.chat.time);
    const formattedDate = ` ${d.getHours()}:${d.getMinutes()} -  ${d.toLocaleDateString()} `;
    return (
        <div className={`${styles.chatContainer} ${styles[align]}`}>
            <div className={styles.Chat}>
                <div className={styles.chatContent}>{props.chat.content}</div>
                <div className={styles.chatTime}>{formattedDate}</div>
            </div>
        </div>
    );
}

export default Chat;
