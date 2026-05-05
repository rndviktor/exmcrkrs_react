import { useAuth } from "react-oidc-context";

export default function MainHeader() {
    const auth = useAuth();

    const handleLogout = () => {
        auth.signoutRedirect();
    };

    return (
        <header className="flex items-center justify-between px-2 py-0.5 bg-transparent mb-1 border-b border-gray-100 pb-1">
            <div className="flex items-center gap-4">
                <h2 className="text-cyan-700 font-medium text-xs">Student.React</h2>
            </div>

            {auth.isAuthenticated && (
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wider font-medium text-gray-400">
                            {auth.user?.profile.preferred_username || auth.user?.profile.name}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="text-[9px] uppercase font-bold text-gray-600 hover:text-cyan-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
}