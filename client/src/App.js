import "./App.scss";
import { Switch, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/landingPage/LandingPage";
import Conversations from "./pages/conversations/Conversations";
import { useContext, useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { actionCreators, actions } from "./reduxStore";
import { AppContext } from "./contextStore/appContext";
import MyProfile from "./pages/myProfile/MyProfile";
import PasswordReset from "./pages/PasswordReset/PasswordReset";
import isEqual from "lodash.isequal";
import { SpinnerCircular } from "spinners-react";

function isUserEqual(user1, user2) {
    return user1?._id === user2?._id;
}

function App() {
    const dispatch = useDispatch();
    const { initializeNewSocket } = useContext(AppContext);
    const currentUser = useSelector(
        (state) => state.user.currentUser,
        isUserEqual
    );
    const location = useLocation();
    const [loadingUser, setLoadingUser] = useState(
        !location.pathname.includes("resetPassword")
    );

    useEffect(() => {
        if (!location.pathname.includes("resetPassword")) {
            dispatch(actionCreators.tryFetchUserByStorageToken())
                .then(() => setLoadingUser(false))
                .catch(() => {
                    setLoadingUser(false);
                    dispatch({ type: actions.LOGOUT_USER });
                });
        }
    }, [dispatch]);

    useEffect(() => {
        if (currentUser) initializeNewSocket();
    }, [currentUser, initializeNewSocket]);

    if (loadingUser)
        return (
            <div className="spinner">
                <SpinnerCircular className={"spinner"} enabled={loadingUser} />
            </div>
        );

    return (
        <div className="App">
            <Switch>
                <Route path="/" exact component={LandingPage} />
                <Route path="/conversations" exact component={Conversations} />
                <Route path="/myProfile" exact component={MyProfile} />
                <Route
                    path="/resetPassword/:passwordResetToken"
                    exact
                    component={PasswordReset}
                />
            </Switch>
        </div>
    );
}

export default App;
