import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import { useDispatch } from "react-redux";
import config from "../../config";
import { MessageContext } from "../../contextStore/messageContext";
import { actionCreators } from "../../reduxStore";
import styles from "./css/Friend.module.scss";
import { MyProfileContext } from "./MyProfile";

function Friend(props) {
    const [friend, setFriend] = useState(undefined);
    const dispatch = useDispatch();
    const { displayMessage } = useContext(MessageContext);
    const { changeRenderToken } = useContext(MyProfileContext);

    useEffect(() => {
        const fetchUserInfo = async function () {
            try {
                const res = await axios({
                    withCredentials: true,
                    method: "GET",
                    url: `${config.url}/api/users/getUserDetails/${props.userId}`,
                });

                if (res.data.status === "success") {
                    setFriend(res.data.user);
                } else throw new Error(res);
            } catch (e) {
                displayMessage("Failed to fetch friend info", true);
            }
        };
        fetchUserInfo();
    }, [props.userId, displayMessage]);

    const deleteFriend = async function (e) {
        try {
            e.preventDefault();
            if (!friend) return displayMessage("Friend loading", true);
            const res = await axios({
                withCredentials: true,
                method: "DELETE",
                url: `${config.url}/api/friendships/deleteFriend`,
                data: {
                    friendId: friend._id,
                },
            });

            if (res.data.status === "success") {
                displayMessage("Friend Deleted");
                await dispatch(actionCreators.fetchFriends());
                changeRenderToken();
            } else throw new Error(res);
        } catch (e) {
            displayMessage(
                "Failed to delete friend " + e.response?.data.message,
                true
            );
        }
    };

    return (
        <div className={styles.Friend}>
            <div className={styles.leftSide}>
                <img src={friend?.photo} alt="profile" />
                {friend?.name || "loading"}
            </div>
            <button className={styles.negativeBtn} onClick={deleteFriend}>
                Delete
            </button>
        </div>
    );
}

export default Friend;
