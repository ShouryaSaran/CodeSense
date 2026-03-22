import {router} from "./app.routes";
import { RouterProvider } from "react-router";

export default function App() {
  return(
    <RouterProvider router={router}/>
  )
}