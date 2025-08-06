import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Login from "./Components/Admin/Login";
import Home from "./Components/Home";
import Protected from "./routes/Protected";
import GuestRoute from "./GuestRoute";


export const router = createBrowserRouter([
    {
        path: "/login",
        element: <GuestRoute>
            <Login />
        </GuestRoute>
    },
    {
        path: "/",
        element: <Root />,
        errorElement: <div>Page not found</div>,
        children: [
            { path: "/", element: <Home /> },
        ]
    },
]);