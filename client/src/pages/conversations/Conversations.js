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

function Conversations(props) {
    const dispatch = useDispatch();
    const history = useHistory();
    const user = useSelector((state) => state.user.currentUser, shallowEqual);
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

    // const logoutHandler = async function (e) {
    //     try {
    //         e.preventDefault();
    //         const res = await axios({
    //             withCredentials: true,
    //             method: "GET",
    //             url: `${config.url}/api/users/logout`,
    //         });

    //         if (res.data.status === "success") {
    //             dispatch({ type: actions.LOGOUT_USER });
    //             history.replace("/");
    //             appCtx.removeSocket();
    //         } else throw new Error(res);
    //     } catch (e) {
    //         displayMessage(
    //             "Failed to logout " + e.response?.data.message,
    //             true
    //         );
    //     }
    // };

    if (!user)
        return (
            <div className={styles.Conversations}>
                <b>Loading ...</b>
            </div>
        );

    return (
        <div className={styles.Conversations}>
            <div className={styles.navbar}>
                <div className={styles.pageHeader}>Conversations</div>
                <div className={styles.activeUser}>
                    <img src={user.photo} alt="Profile" />
                    <Link className={styles.profileLink} to="/myProfile">
                        {user.name}
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
                        <AllFriendsChatList friends={friends} />
                        <Chatbox />
                    </>
                )}
            </div>
        </div>
    );
}

export default Conversations;
