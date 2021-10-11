import axios from "axios";
import React, { useState, useContext, useCallback } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import config from "../../config";
import { AppContext } from "../../contextStore/appContext";
import { MessageContext } from "../../contextStore/messageContext";
import { actions } from "../../reduxStore";
import AccountSection from "./AccountSections";
import AllNonFriends from "./AllNonFriends";
import styles from "./css/MyProfile.module.scss";
import MyFriends from "./MyFriends";
import PendingRequestList from "./PendingRequestList";
import { FaInfoCircle } from "react-icons/fa";

const MyProfileContext = React.createContext({
    renderToken: null,
    changeRenderToken: () => {},
});

function MyProfile(props) {
    const currentUser = useSelector(
        (state) => state.user.currentUser,
        shallowEqual
    );
    const unreadChats = useSelector(
        (state) => state.chat.unreadChats,
        shallowEqual
    );
    const dispatch = useDispatch();
    const history = useHistory();
    const appCtx = useContext(AppContext);
    const [renderToken, setRenderToken] = useState(0);
    const { displayMessage } = useContext(MessageContext);

    const logoutHandler = async function (e) {
        try {
            e.preventDefault();
            const res = await axios({
                withCredentials: true,
                method: "GET",
                url: `${config.url}/api/users/logout`,
            });

            if (res.data.status === "success") {
                dispatch({ type: actions.LOGOUT_USER });
                history.replace("/");
                appCtx.removeSocket();
            } else throw new Error(res);
        } catch (e) {
            displayMessage(
                "Failed to logout " + e.response?.data.message,
                true
            );
        }
    };

    const changeRenderToken = useCallback(() => {
        setRenderToken((prev) => 1 - prev);
    }, []);

    if (!currentUser)
        return (
            <div className={styles.MyProfile}>
                <b>Loading...</b>
            </div>
        );

    const totalUnreadChats = Object.values(unreadChats).reduce(
        (sum, e) => sum + e,
        0
    );

    return (
        <div className={styles.MyProfile}>
            <div className={styles.navbar}>
                <Link className={styles.navBarBtn} to="/conversations">
                    {"Conversations "}
                    {totalUnreadChats !== 0 && (
                        <>
                            &nbsp;
                            <FaInfoCircle />
                            {totalUnreadChats}
                        </>
                    )}
                </Link>
                <button className={styles.navBarBtn} onClick={logoutHandler}>
                    Logout
                </button>
            </div>
            <div className={styles.content}>
                <div className={styles.friendSection}>
                    <div className={styles.heading}>Friend Section</div>
                    <div className={styles.friendSectionFlexContainer}>
                        <MyProfileContext.Provider
                            value={{ renderToken, changeRenderToken }}
                        >
                            <AllNonFriends />
                            <MyFriends />
                            <PendingRequestList />
                        </MyProfileContext.Provider>
                    </div>
                </div>
                <AccountSection />
            </div>
        </div>
    );
}

export default MyProfile;
export { MyProfileContext };
