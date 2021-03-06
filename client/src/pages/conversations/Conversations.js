import React, { useContext, useEffect } from "react";
import styles from "./css/Conversations.module.scss";
import { Link, useHistory } from "react-router-dom";
import Chatbox from "./ChatBox";
import axios from "axios";
import config from "../../config";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { AppContext } from "../../contextStore/appContext";
import { actionCreators, actions } from "../../reduxStore/index";
import AllFriendsChatList from "./AllFriendsChatList";
import { MessageContext } from "../../contextStore/messageContext";
import { SpinnerCircular } from "spinners-react";

function Conversations(props) {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.currentUser, shallowEqual);
    const chattingWith = useSelector(
        (state) => state.chat.chattingWith,
        shallowEqual
    );
    const appCtx = useContext(AppContext);
    const friends = useSelector((state) => state.user.friends, shallowEqual);
    const { displayMessage } = useContext(MessageContext);

    useEffect(() => {
        if (!user) return;
        dispatch(actionCreators.fetchFriends());
        dispatch(actionCreators.fetchOnlineUsers());
        dispatch(actionCreators.fetchUnreadChats());
        dispatch(actionCreators.fetchLastChatTimes());
    }, [dispatch, user]);

    if (!user)
        return (
            <div className={styles.Conversations}>
                <div className="spinner">
                    <SpinnerCircular className={"spinner"} enabled={!user} />
                </div>
            </div>
        );

    return (
        <div className={styles.Conversations}>
            <div className={styles.navbar}>
                <div className={styles.pageHeader}>Conversations</div>
                <div className={styles.activeUser}>
                    <img src={user.photo} alt="Profile" />
                    <Link className={styles.profileLink} to="/myProfile">
                        {user.name.split(" ")[0]}
                    </Link>
                </div>
            </div>
            <div className={styles.Container}>
                {!appCtx.socket && <h1>Establishing live chat connection</h1>}
                {appCtx.socket && !appCtx.socket.connected && (
                    <div className={styles.notConnectedMessage}>
                        {" "}
                        You are not connected to the internet{" "}
                    </div>
                )}
                {appCtx.socket && appCtx.socket?.connected && (
                    <>
                        {(window.outerWidth >= config.mobileWidth ||
                            !chattingWith) && (
                            <AllFriendsChatList friends={friends} />
                        )}
                        {(window.outerWidth >= config.mobileWidth ||
                            chattingWith) && <Chatbox />}
                    </>
                )}
            </div>
        </div>
    );
}

export default Conversations;
