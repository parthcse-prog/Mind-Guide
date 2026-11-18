import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { store } from "./redux/store.js";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

const savedId = localStorage.getItem("saarthi_google_client_id");
const googleClientId =
  (savedId && !savedId.includes("exampleclientid") ? savedId : null) ||
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "799502808392-6ntdd1hqkpjqagf63ujn67dfstv0bvrb.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </Provider>
);
