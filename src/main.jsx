import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import InvestorOS from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <InvestorOS />
  </StrictMode>
);
