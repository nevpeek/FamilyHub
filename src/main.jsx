import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { installFamilyHubFetchAuth } from "./config/api.js";

installFamilyHubFetchAuth();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);