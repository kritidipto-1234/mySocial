import axios from "axios";
import React, { useState, useEffect, useCallback, useContext } from "react";
import config from "../../config";
import { MessageContext } from "../../contextStore/messageContext";
import styles from "./css/AllNonFriends.module.scss";
import { MyProfileContext } from "./MyProfile";
import NonFriend from "./NonFriend";

function AllNonFriends(props) {
    const [nonFriendList, setNonFriendList] = useState([]);

    const { renderToken } = useContext(MyProfileContext);
    const { displayMessage } = useContext(MessageContext);

    const fetchNonFriends = useCallback(
        async function () {
            try {
                const res = await axios({
                    withCredentials: true,
                    method: "GET",
                    url: `${config.url}/api/friendships/getAllNonFriends`,
                });

                if (res.data.status === "success") {
                    setNonFriendList(res.data.nonFriends);
                } else throw new Error(res);
            } catch (e) {
                displayMessage(e.response.data.message, true);
            }
        },
        [displayMessage]
    );

    useEffect(() => {
        fetchNonFriends();
    }, [fetchNonFriends, renderToken]);

    return (
        <div className={styles.AllNonFriends}>
            <div className={styles.listHeading}>All Users</div>
            <div className={styles.nonFriendsList}>
                {nonFriendList.map((id) => (
                    <NonFriend
                        key={id}
                        userId={id}
                        fetchNonFriends={fetchNonFriends}
                    />
                ))}
            </div>
        </div>
    );
}

export default AllNonFriends;
