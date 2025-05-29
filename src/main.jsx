// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import '@livekit/components-styles';
import "./index.css";

import { BrowserRouter } from "react-router-dom";
// Redux 관련 import
import { Provider } from "react-redux";
import store from "./store";    // src/store/index.js 에서 export 한 스토어

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);