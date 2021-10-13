import React, { useState, useEffect, useCallback } from "react";
import styles from "./css/FriendChatLink.module.scss";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import catchAsync from "../../utils/catchAsync";
import config from "../../config";
import axios from "axios";
import { FaInfoCircle } from "react-icons/fa";
import { actions } from "../../reduxStore";

function FriendChatLink(props) {
    const [friend, setFriend] = useState();
    const onlineUsers = useSelector(
        (state) => state.chat.onlineUsers,
        shallowEqual
    );
    const unreadChats = useSelector(
        (state) => state.chat.unreadChats,
        shallowEqual
    );
    const chattingWith = useSelector(
        (state) => state.chat.chattingWith,
        shallowEqual
    );
    const dispatch = useDispatch();

    const fetchFriendInfo = useCallback(
        catchAsync(async function () {
            const res = await axios({
                withCredentials: true,
                method: "GET",
                url: `${config.url}/api/users/getUserDetails/${props.friendId}`,
            });

            if (res.data.status === "success") {
                setFriend(res.data.user);
            } else throw new Error(res);
        }),
        []
    );

    useEffect(() => {
        fetchFriendInfo();
    }, [fetchFriendInfo]);

    const isOnline = onlineUsers.includes(props.friendId);
    const pendingChatCount = unreadChats[props.friendId] || 0;
    const status = isOnline ? "online" : "offline";

    function onClickHandler(e) {
        if (!friend) return;
        dispatch({
            type: actions.SET_CHATTINGWITH,
            chattingWith: friend,
        });
    }

    return (
        <div
            className={
                styles.FriendChatLink +
                " " +
                styles[status] +
                " " +
                (chattingWith?._id === props.friendId
                    ? styles.chattingWith
                    : "")
            }
            onClick={onClickHandler}
        >
            <div className={styles.userLinkLeft}>
                <img src={friend?.photo} alt="DP" />
                {" " + (friend?.name || "Loading") + " "}
            </div>
            <div className={styles.friendChatInfo}>
                <span className={styles.onlineIndicator}> </span>
                &nbsp;&nbsp;&nbsp;
                {pendingChatCount !== 0 && (
                    <>
                        <FaInfoCircle /> {pendingChatCount}
                    </>
                )}
            </div>
        </div>
    );
}

export default FriendChatLink;
