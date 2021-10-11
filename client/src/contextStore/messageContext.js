import React, { useState, useRef, useCallback, useMemo } from "react";
import Message from "../components/Message";

const MessageContext = React.createContext({
    message: undefined,
    isErrorMessage: undefined,
    displayMessage: (message, isErrorMessage, duration) => {},
    closeMessage: () => {},
});

function MessageContextProvider(props) {
    const [message, setMessage] = useState("");
    const [isMessageDisplayed, setIsMessageDisplayed] = useState(false);
    const [isErrorMessage, setIsErrorMessage] = useState(false);

    const timeoutRef = useRef(undefined);

    const displayMessage = useCallback(
        (message, isErrorMessage = false, duration = 4000) => {
            clearTimeout(timeoutRef.current);
            setMessage(message);
            setIsErrorMessage(isErrorMessage);
            setIsMessageDisplayed(true);
            timeoutRef.current = setTimeout(() => {
                setIsMessageDisplayed(false);
                setMessage("");
                setIsErrorMessage(false);
            }, duration);
        },
        []
    );

    const closeMessage = useCallback(() => {
        setIsMessageDisplayed(false);
        setMessage("");
        setIsErrorMessage(false);
        clearTimeout(timeoutRef.current);
    }, []);

    const value = useMemo(() => {
        return {
            message,
            isErrorMessage,
            displayMessage,
            closeMessage,
        };
    }, [message, isErrorMessage, displayMessage, closeMessage]);

    return (
        <MessageContext.Provider value={value}>
            {props.children}
            {isMessageDisplayed && <Message />}
        </MessageContext.Provider>
    );
}

export { MessageContext, MessageContextProvider };
