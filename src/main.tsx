import React from "react";
import ReactDOM from "react-dom/client";
import "./theme/theme.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import ErrorPage from "./routes/ErrorPage";
import { TariProvider } from "@tari-project/tarijs";

const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);


declare global {

  interface Window {
    tari: TariProvider;
  }
}
