import { Outlet } from "react-router-dom";
import MainHeader from "../components/MainHeader.tsx";

export default function RootLayout() {
    return <div className="h-screen w-screen">
        <MainHeader />
        <Outlet />
    </div>
}