import "./App.scss";
import { Switch, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/landingPage/LandingPage";
import Conversations from "./pages/conversations/Conversations";
import { useContext, useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { actionCreators, actions } from "./reduxStore";
import { AppContext } from "./contextStore/appContext";
import MyProfile from "./pages/myProfile/MyProfile";
import PasswordReset from "./pages/PasswordReset/PasswordReset";
import isEqual from "lodash.isequal";

function App() {
    const dispatch = useDispatch();
    const { initializeNewSocket } = useContext(AppContext);
    const currentUser = useSelector((state) => state.user.currentUser, isEqual);

    const location = useLocation();

    useEffect(() => {
        if (!location.pathname.includes("resetPassword")) {
            dispatch(actionCreators.tryFetchUserByStorageToken()).catch(() => {
                dispatch({ type: actions.LOGOUT_USER });
            });
        }
    }, [dispatch]);

    useEffect(() => {
        if (currentUser) initializeNewSocket();
    }, [currentUser, initializeNewSocket]);

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
