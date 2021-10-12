import axios from "axios";
import React, { useState, useEffect, useCallback, useContext } from "react";
import config from "../../config";
import { MessageContext } from "../../contextStore/messageContext";
import styles from "./css/PendingRequestList.module.scss";
import { MyProfileContext } from "./MyProfile";
import PendingRequest from "./PendingRequest";

function PendingRequestList(props) {
    const [requestList, setRequestList] = useState([]);
    const { displayMessage } = useContext(MessageContext);
    const { renderToken } = useContext(MyProfileContext);

    const getPendingFriendRequests = useCallback(
        async function () {
            try {
                const res = await axios({
                    withCredentials: true,
                    method: "GET",
                    url: `${config.url}/api/friendships/getPendingFriendRequests`,
                });

                if (res.data.status === "success") {
                    setRequestList(res.data.pendingRequests);
                } else throw new Error(res);
            } catch (e) {
                displayMessage("Failed to fetch Pending requests", true);
            }
        },
        [displayMessage]
    );

    useEffect(() => {
        getPendingFriendRequests();
    }, [getPendingFriendRequests, renderToken]);

    return (
        <div className={styles.PendingRequestList}>
            <div className={styles.listHeading}>Pending Requests</div>
            <div className={styles.requestList}>
                {requestList.map((r) => (
                    <PendingRequest
                        key={r._id}
                        request={r}
                        getPendingFriendRequests={getPendingFriendRequests}
                    />
                ))}
            </div>
        </div>
    );
}

export default PendingRequestList;
