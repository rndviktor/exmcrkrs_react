import { useAuth } from "react-oidc-context";

export default function MainHeader() {
    const auth = useAuth();

    const handleLogout = () => {
        auth.signoutRedirect();
    };

    return (
        <header className="flex justify-between px-6 bg-white ">
            <h2 className="text-cyan-600 font-semibold">Teacher.React</h2>

            {auth.isAuthenticated && (
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                            {auth.user?.profile.preferred_username || auth.user?.profile.name}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors shadow-sm"
                    >
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
}