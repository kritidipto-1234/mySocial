import React, { useCallback, useContext, useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { actionCreators, actions } from "../reduxStore";
import notificationSound from "../assets/Notification.mp3";
import io from "socket.io-client";
import config from "../config";
import { MessageContext } from "./messageContext";

const AppContext = React.createContext({
    socket: undefined,
    initializeNewSocket: () => {},
    removeSocket: () => {},
});

const audio = new Audio(notificationSound);

function AppContextProvider(props) {
    const [socket, setSocket] = useState(undefined);
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    const chattingWith = useSelector(
        (state) => state.chat.chattingWith,
        shallowEqual
    );
    const currentUser = useSelector(
        (state) => state.user.currentUser,
        shallowEqual
    );
    const jwtToken = useSelector((state) => state.user.jwtToken);

    const dispatch = useDispatch();
    const { displayMessage } = useContext(MessageContext);

    useEffect(() => {
        if (!socket) return;

        socket.on("connect", () => {
            // console.log(`Connected with socket id : ${socket.id}`);
            setIsSocketConnected(true);
        });

        socket.on("connect_error", (err) => {
            let message = err.message;
            if (message.includes("xhr poll error"))
                message =
                    "Attempt to reconnect failed.Please check ur internet";
            displayMessage(message, true);
        });

        socket.on("auth_error", (err) => {
            displayMessage(err.message, true);
        });

        socket.on("updateOnlineUserList", (onlineUsers) => {
            dispatch({ type: actions.SET_ONLINEUSERS, onlineUsers });
        });

        socket.on("disconnect", () => {
            // console.log("Disconnecting");
            displayMessage("Going Offline");
            setIsSocketConnected(false);
        });

        socket.io.on("reconnect", () => {
            displayMessage(`Reconnected.Fetching latest data `);
            dispatch(actionCreators.fetchFriends());
            dispatch(actionCreators.fetchOnlineUsers());
            dispatch(actionCreators.fetchUnreadChats());
            dispatch(actionCreators.fetchLastChatTimes());
        });

        return () => {
            socket.removeAllListeners();
        };
    }, [socket, dispatch]);

    useEffect(() => {
        if (!socket || !currentUser) return;
        //we might have missed some events during re rendering(removeAllListeners)
        //so we need to fetch latest data from server manually
        dispatch(actionCreators.fetchFriends());
        dispatch(actionCreators.fetchOnlineUsers());
        dispatch(actionCreators.fetchUnreadChats());
        dispatch(actionCreators.fetchLastChatTimes());

        socket.on("chatMessage", (msg) => {
            const { time } = msg;
            let friendId;
            if (msg.sender === String(currentUser._id)) friendId = msg.receiver;
            if (msg.receiver === String(currentUser._id)) friendId = msg.sender;

            dispatch({ type: actions.UPDATE_LAST_CHAT_TIMES, friendId, time });

            if (msg.sender !== String(currentUser._id)) audio.play();
        });

        socket.on("chatMessage", (msg) => {
            //Here we only need to react to messages from
            //friends apart  from the one user is chatting with
            //these messages become unread
            if (
                (chattingWith &&
                    String(chattingWith._id) === String(msg.sender)) ||
                String(currentUser._id) === String(msg.sender)
            )
                return;
            dispatch({ type: actions.ADD_UNREADCHAT, newChat: msg });
        });

        return () => {
            socket.removeAllListeners("chatMessage");
        };
    }, [socket, dispatch, chattingWith, currentUser]);

    const initializeNewSocket = useCallback(() => {
        const socket = io(config.url, { auth: { jwtToken } });
        setSocket(socket);
    }, [jwtToken]);

    const removeSocket = useCallback(() => {
        socket.disconnect();
        socket.removeAllListeners();
        setSocket(undefined);
    }, [socket]);

    return (
        <AppContext.Provider
            value={{
                socket,
                initializeNewSocket,
                removeSocket,
            }}
        >
            {props.children}
        </AppContext.Provider>
    );
}

export { AppContext, AppContextProvider };
