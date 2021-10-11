import React, {
    useState,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";
import styles from "./css/ChatBox.module.scss";
import Chat from "./Chat";
import axios from "axios";
import config from "../../config";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { AppContext } from "../../contextStore/appContext";
import catchAsync from "../../utils/catchAsync";
import { actions } from "../../reduxStore";
import { FaArrowLeft } from "react-icons/fa";

function ChatBox() {
    const inputMsgRef = useRef();
    const [chats, setChats] = useState([]);
    const currentUser = useSelector(
        (state) => state.user.currentUser,
        shallowEqual
    );
    const chattingWith = useSelector(
        (state) => state.chat.chattingWith,
        shallowEqual
    );
    const onlineUsers = useSelector(
        (state) => state.chat.onlineUsers,
        shallowEqual
    );
    const jwtToken = useSelector((state) => state.user.jwtToken);
    const messagesEndRef = useRef(null);
    const { socket } = useContext(AppContext);
    const dispatch = useDispatch();
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, []);

    const fetchChats = useCallback(
        catchAsync(async () => {
            const res = await axios({
                withCredentials: true,
                method: "GET",
                url: `${config.url}/api/chats/getChatsWith/${chattingWith._id}`,
            });

            if (res.data.status === "success") {
                setChats([...res.data.chats]);
                dispatch({ type: actions.MARK_CURRENT_CONVERSATION_AS_READ });
            }
        }),
        [chattingWith?._id]
    );

    const sendChatAsRead = useCallback(
        catchAsync(async (chat) => {
            await axios({
                withCredentials: true,
                method: "PATCH",
                url: `${config.url}/api/chats/markChatAsRead/${chat._id}`,
            });
        }),
        []
    );

    useEffect(() => {
        scrollToBottom();
    }, [chats.length, scrollToBottom]);

    useEffect(() => {
        if (!chattingWith || !socket) return;
        const chatMessageHandler = (newChat) => {
            //Here we only need to react to messages like chattingWith->user
            //or user->chattingWith
            //these messages become read
            if (
                String(chattingWith._id) === String(newChat.sender) ||
                (String(currentUser._id) === String(newChat.sender) &&
                    String(chattingWith._id) === String(newChat.receiver))
            ) {
                setChats((prev) => [...prev, newChat]);
                if (String(chattingWith._id) === String(newChat.sender))
                    sendChatAsRead(newChat);
            }
        };

        socket.on("chatMessage", chatMessageHandler);
        return () => socket.off("chatMessage", chatMessageHandler);
    }, [chattingWith, sendChatAsRead, currentUser, socket]);

    useEffect(() => {
        if (!chattingWith) return;
        setChats([]);
        fetchChats();
        inputMsgRef.current.focus();
    }, [chattingWith, fetchChats]);

    useEffect(() => {
        return () => {
            dispatch({
                type: actions.SET_CHATTINGWITH,
                chattingWith: undefined,
            });
        };
    }, [dispatch]);

    function sendMessage(e) {
        e.preventDefault();
        if (inputMsgRef.current.value.trim() === "") return;
        const time = new Date();
        const newChat = {
            sender: currentUser._id,
            receiver: chattingWith._id,
            content: inputMsgRef.current.value,
            time,
        };
        setChats((prev) => [...prev, newChat]);
        socket.emit("chatMessage", {
            auth: { jwtToken },
            msg: newChat,
        });
        dispatch({
            type: actions.UPDATE_LAST_CHAT_TIMES,
            friendId: chattingWith._id,
            time,
        });
        inputMsgRef.current.value = "";
        inputMsgRef.current.focus();
    }

    function clearChattingWith() {
        dispatch({ type: actions.SET_CHATTINGWITH, chattingWith: null });
    }

    if (!chattingWith)
        return (
            <div className={styles.ChatBox}>
                <div className={styles.chatBoxMessage}>
                    Click on a user to chat with them
                </div>
            </div>
        );

    let status = "Offline";
    if (onlineUsers.includes(chattingWith._id)) status = "Online";

    return (
        <div className={styles.ChatBox}>
            <div className={styles.chatBoxHeader}>
                <button
                    className={styles.clearChattingWithBtn}
                    onClick={clearChattingWith}
                >
                    <FaArrowLeft />
                </button>
                <img src={chattingWith.photo} alt="profile" />
                <span>
                    {chattingWith.name || "Loading"}
                    <br />
                    <span className={styles[status]}>{status}</span>
                </span>
            </div>
            <div className={styles.chatMessageList}>
                {chats.map((c, i) => (
                    <Chat otherUser={chattingWith} key={i} chat={c} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className={styles.chatSender} onSubmit={sendMessage}>
                <div className={styles.container}>
                    <input
                        className={styles.chatInput}
                        placeholder="Type message here and press send "
                        ref={inputMsgRef}
                    />
                    <button className={styles.chatSendBtn} type="submit">
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatBox;
