import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./reduxStore/index";
import { AppContextProvider } from "./contextStore/appContext";
import { MessageContextProvider } from "./contextStore/messageContext";

ReactDOM.render(
    <Provider store={store}>
        <MessageContextProvider>
            <AppContextProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AppContextProvider>
        </MessageContextProvider>
    </Provider>,
    document.getElementById("root")
);
