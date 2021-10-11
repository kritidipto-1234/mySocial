import React, { useEffect, useState } from "react";
import FriendChatLink from "./FriendChatLink";
import styles from "./css/AllFriendsChatList.module.scss";
import { shallowEqual, useSelector } from "react-redux";
import axios from "axios";
import config from "../../config";

function AllFriendsChatList(props) {
    const lastChatTimes = useSelector(
        (state) => state.chat.lastChatTimes,
        shallowEqual
    );

    const [searchKey, setSearchKey] = useState("");
    const [friendNames, setFriendNames] = useState(undefined);

    function compDates(id1, id2) {
        if (lastChatTimes[id1] && !lastChatTimes[id2]) return -1;
        if (!lastChatTimes[id1] && lastChatTimes[id2]) return 1;
        if (!lastChatTimes[id1] && !lastChatTimes[id2]) return 0;

        const time1 = new Date(lastChatTimes[id1]);
        const time2 = new Date(lastChatTimes[id2]);

        if (time1 > time2) return -1;
        if (time1 < time2) return 1;
        if (time1 === time2) return 0;
    }

    useEffect(() => {
        async function fetchFriendNames() {
            try {
                const res = await axios({
                    withCredentials: true,
                    method: "GET",
                    url: `${config.url}/api/friendships/getAllFriendNames`,
                });

                if (res.data.status === "success") {
                    setFriendNames(res.data.friendNames);
                } else throw new Error(res);
            } catch (e) {}
        }
        fetchFriendNames();
    }, []);

    function searchKeyChanger(e) {
        setSearchKey(e.target.value);
    }

    const friends = [...props.friends];

    return (
        <div className={styles.AllFriendsChatList}>
            <div className={styles.sectionHeader}>
                My Friends
                <input
                    className={styles.friendFilter}
                    onChange={searchKeyChanger}
                    placeholder="🔍 Filter by name"
                />
            </div>
            <div className={styles.userList}>
                {friends
                    .filter((fid) => {
                        if (searchKey === "" || !friendNames) return true;
                        return friendNames[fid]?.includes(
                            searchKey.toLowerCase()
                        );
                    })
                    .sort(compDates)
                    .map((fid) => (
                        <FriendChatLink key={fid} friendId={fid} />
                    ))}
                {friends.length === 0 && (
                    <div className={styles.noFriendMessage}>
                        You have no friends .Go to your profile and send friend
                        requests to other users
                    </div>
                )}
            </div>
        </div>
    );
}

export default AllFriendsChatList;
