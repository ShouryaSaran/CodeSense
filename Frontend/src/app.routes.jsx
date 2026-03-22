import {createBrowserRouter} from "react-router"
import Home from "./Features/CodeReview/Pages/Home"

export const router = createBrowserRouter([
    {
        path: '/',
        element:<Home></Home>
    }
])