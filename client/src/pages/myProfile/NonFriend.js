import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import config from "../../config";
import { MessageContext } from "../../contextStore/messageContext";
import styles from "./css/NonFriend.module.scss";
import { MyProfileContext } from "./MyProfile";

function NonFriend(props) {
    const [nonFriend, setNonFriend] = useState(undefined);

    const { changeRenderToken } = useContext(MyProfileContext);
    const { displayMessage } = useContext(MessageContext);

    useEffect(() => {
        const fetchUserInfo = async function () {
            try {
                const res = await axios({
                    withCredentials: true,
                    method: "GET",
                    url: `${config.url}/api/users/getUserDetails/${props.userId}`,
                });

                if (res.data.status === "success") {
                    setNonFriend(res.data.user);
                } else throw new Error(res);
            } catch (e) {
                displayMessage("Unable to fetch user info", true);
            }
        };
        fetchUserInfo();
    }, [props.userId, displayMessage]);

    const sendFriendRequest = async function (e) {
        try {
            e.preventDefault();
            if (!nonFriend)
                return displayMessage("User hasnt loaded yet", true);
            const res = await axios({
                withCredentials: true,
                method: "POST",
                url: `${config.url}/api/friendships/sendFriendRequest`,
                data: {
                    targetId: props.userId,
                },
            });

            if (res.data.status === "success") {
                displayMessage("Friend Request send");
                await props.fetchNonFriends();
                changeRenderToken();
            } else throw new Error(res);
        } catch (e) {
            displayMessage(
                e.response?.data.message + " Couldnt send friend request",
                true
            );
        }
    };

    return (
        <div className={styles.NonFriend}>
            <div className={styles.leftSide}>
                <img alt="DP" src={nonFriend?.photo} />
                {nonFriend?.name || "Loading"}
            </div>
            <button onClick={sendFriendRequest}>Request</button>
        </div>
    );
}

export default NonFriend;
