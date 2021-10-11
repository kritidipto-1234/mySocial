import React, { useEffect, useContext } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { actionCreators } from "../../reduxStore";
import styles from "./css/MyFriends.module.scss";
import Friend from "./Friend";
import { MyProfileContext } from "./MyProfile";

function MyFriends(props) {
    const friends = useSelector((state) => state.user.friends, shallowEqual);
    const dispatch = useDispatch();

    const { renderToken } = useContext(MyProfileContext);

    useEffect(() => {
        dispatch(actionCreators.fetchFriends());
    }, [dispatch, renderToken]);

    return (
        <div className={styles.MyFriends}>
            <div className={styles.listHeading}>My Friends</div>
            <div className={styles.friendsList}>
                {friends.map((id) => (
                    <Friend key={id} userId={id} />
                ))}
            </div>
        </div>
    );
}

export default MyFriends;
