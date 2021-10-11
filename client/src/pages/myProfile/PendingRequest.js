import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import config from "../../config";
import { MessageContext } from "../../contextStore/messageContext";
import styles from "./css/PendingRequest.module.scss";
import { MyProfileContext } from "./MyProfile";

function PendingRequest(props) {
    const [sender, setSender] = useState(undefined);

    const { changeRenderToken } = useContext(MyProfileContext);
    const { displayMessage } = useContext(MessageContext);

    useEffect(() => {
        const fetchSenderInfo = async function () {
            try {
                const res = await axios({
                    withCredentials: true,
                    method: "GET",
                    url: `${config.url}/api/users/getUserDetails/${props.request.sender}`,
                });

                if (res.data.status === "success") {
                    setSender(res.data.user);
                } else throw new Error(res);
            } catch (e) {
                displayMessage("Failed to load friend request sender", true);
            }
        };
        fetchSenderInfo();
    }, [props.request.sender, displayMessage]);

    const acknowledgeFriendRequest = async function (type, e) {
        try {
            e.preventDefault();
            if (!sender) return displayMessage(`Request loading details`, true);
            const res = await axios({
                withCredentials: true,
                method: "POST",
                url: `${config.url}/api/friendships/acknowledgeFriendRequest/${props.request._id}`,
                data: {
                    type,
                },
            });

            if (res.data.status === "success") {
                displayMessage(`Friend request ${type}ed`);
                await props.getPendingFriendRequests();
                changeRenderToken();
            } else throw new Error(res);
        } catch (e) {
            displayMessage(
                `Friend request ${type} failed ` + e.response?.data.message,
                true
            );
        }
    };

    return (
        <div className={styles.PendingRequest}>
            <div className={styles.leftSide}>
                <img src={sender?.photo} alt="DP" />
                {sender?.name || "loading"}
            </div>
            <div>
                <button onClick={acknowledgeFriendRequest.bind(null, "accept")}>
                    Accept
                </button>
                <button
                    className={styles.negativeBtn}
                    onClick={acknowledgeFriendRequest.bind(null, "reject")}
                >
                    Reject
                </button>
            </div>
        </div>
    );
}

export default PendingRequest;
