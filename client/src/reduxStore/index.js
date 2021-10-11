import cloneDeep from "clone-deep";
import thunk from "redux-thunk";
import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import catchAsync from "../utils/catchAsync";
import axios from "axios";
import config from "../config";

const initialUserState = { jwtToken: null, currentUser: null, friends: [] };
const initialChatState = {
    unreadChats: {},
    onlineUsers: [],
    chattingWith: null,
    lastChatTimes: {},
};
const initialState = { chat: initialChatState, user: initialUserState };

const actions = {
    LOGIN_USER: "loginUser",
    SET_JWTTOKEN: "setjwtToken",
    LOGOUT_USER: "logoutUser",
    SET_UNREADCHATS: "setUnreadChats",
    SET_ONLINEUSERS: "setOnlineUsers",
    SET_FRIENDS: "setFriends",
    SET_CHATTINGWITH: "setChattingWith",
    ADD_UNREADCHAT: "addUnreadChat",
    MARK_CURRENT_CONVERSATION_AS_READ: "markCurrentConversationAsRead",
    SET_LAST_CHAT_TIMES: "setLastChatTimes",
    UPDATE_LAST_CHAT_TIMES: "updateLastChatTimes",
    SET_USER: "setUser",
};

const actionCreators = {
    fetchUnreadChats: () => {
        return catchAsync(async (dispatch, getState) => {
            const res = await axios({
                withCredentials: true,
                method: "GET",
                url: `${config.url}/api/chats/getUnreadChats`,
            });

            if (res.data.status === "success")
                dispatch({
                    type: actions.SET_UNREADCHATS,
                    unreadChats: res.data.unreadChats,
                });
        });
    },
    fetchOnlineUsers: () => {
        return catchAsync(async (dispatch, getState) => {
            const res = await axios({
                withCredentials: true,
                method: "GET",
                url: `${config.url}/api/chats/getOnlineUsers`,
            });

            if (res.data.status === "success")
                dispatch({
                    type: actions.SET_ONLINEUSERS,
                    onlineUsers: res.data.onlineUsers,
                });
        });
    },
    fetchFriends: () => {
        return catchAsync(async (dispatch, getState) => {
            const res = await axios({
                withCredentials: true,
                method: "GET",
                url: `${config.url}/api/friendships/getAllFriends`,
            });

            if (res.data.status === "success")
                dispatch({
                    type: actions.SET_FRIENDS,
                    friends: res.data.friends,
                });

            return { 112: "nunu" };
        });
    },
    fetchLastChatTimes: () => {
        return catchAsync(async (dispatch, getState) => {
            const res = await axios({
                withCredentials: true,
                method: "GET",
                url: `${config.url}/api/chats/getLastChatTimes`,
            });

            if (res.data.status === "success")
                dispatch({
                    type: actions.SET_LAST_CHAT_TIMES,
                    lastChatTimes: res.data.lastChatTimes,
                });
        });
    },
    tryFetchUserByStorageToken: () => {
        return async (dispatch, getState) => {
            try {
                const res = await axios({
                    withCredentials: true,
                    method: "GET",
                    url: `${config.url}/api/users/validateLoginToken`,
                });

                if (res.data.status === "success") {
                    dispatch({
                        type: actions.LOGIN_USER,
                        user: { ...res.data.user },
                        jwtToken: res.data.jwtToken,
                    });
                    await dispatch(actionCreators.fetchUnreadChats());
                    await dispatch(actionCreators.fetchOnlineUsers());
                    await dispatch(actionCreators.fetchFriends());
                    await dispatch(actionCreators.fetchLastChatTimes());
                }
            } catch (e) {
                throw e;
            }
        };
    },
};

function chatReducer(state = initialChatState, action) {
    const newState = cloneDeep(state);

    switch (action.type) {
        case actions.SET_ONLINEUSERS:
            newState.onlineUsers = cloneDeep(action.onlineUsers);
            break;

        case actions.SET_UNREADCHATS:
            newState.unreadChats = cloneDeep(action.unreadChats);
            break;

        case actions.SET_CHATTINGWITH:
            newState.chattingWith = cloneDeep(action.chattingWith);
            break;

        case actions.ADD_UNREADCHAT:
            const sender = action.newChat.sender;
            if (newState.unreadChats[sender]) newState.unreadChats[sender]++;
            else newState.unreadChats[sender] = 1;
            break;

        case actions.SET_LAST_CHAT_TIMES:
            newState.lastChatTimes = action.lastChatTimes;
            break;

        case actions.UPDATE_LAST_CHAT_TIMES:
            newState.lastChatTimes[action.friendId] = action.time;
            break;

        case actions.MARK_CURRENT_CONVERSATION_AS_READ:
            delete newState.unreadChats[String(newState.chattingWith._id)];
            break;

        case actions.LOGOUT_USER:
            newState.unreadChats = {};
            newState.onlineUsers = [];
            newState.chattingWith = undefined;
            newState.lastChatTimes = {};
            break;

        default:
    }

    return newState;
}

function userReducer(state = initialUserState, action) {
    const newState = cloneDeep(state);

    switch (action.type) {
        case actions.LOGIN_USER:
            newState.currentUser = cloneDeep(action.user);
            newState.jwtToken = action.jwtToken;
            break;

        case actions.SET_USER:
            newState.currentUser = cloneDeep(action.user);
            break;

        case actions.SET_JWTTOKEN:
            newState.jwtToken = action.jwtToken;
            break;

        case actions.SET_FRIENDS:
            newState.friends = cloneDeep(action.friends);
            break;

        case actions.LOGOUT_USER:
            newState.currentUser = undefined;
            newState.jwtToken = "random-invalid-jwt";
            newState.friends = [];
            break;

        default:
    }

    return newState;
}

const reducer = combineReducers({ chat: chatReducer, user: userReducer });
const reduxDevToolEnabler =
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__();

const store = createStore(
    reducer,
    initialState,
    compose(applyMiddleware(thunk))
);

export default store;
export { actions, actionCreators };
