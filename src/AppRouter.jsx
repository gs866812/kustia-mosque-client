import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Login from "./Components/Admin/Login";
import Home from "./Components/Home";
import Protected from "./routes/Protected";
import GuestRoute from "./GuestRoute";
import DonationList from "./Components/Pages/DonationList";
import ExpenseList from "./Components/Pages/ExpenseList";
import HadithList from "./Components/Pages/HadithList";
import DonorList from "./Components/Pages/DonorList";



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
            { path: "/donation", element: <Protected><DonationList /></Protected> },
            { path: "/expense", element: <Protected><ExpenseList /></Protected> },
            { path: "/hadith", element: <Protected><HadithList /></Protected> },
            { path: "/donorList", element: <Protected><DonorList /></Protected> },
        ]
    },
]);