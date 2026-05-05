import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";
import { MdPostAdd } from "react-icons/md";

export default function MainHeader() {
    const auth = useAuth();

    const handleLogout = () => {
        auth.signoutRedirect();
    };

    return (
        <header className="flex items-center justify-between px-2 py-0.5 bg-transparent mb-1 border-b border-gray-100 pb-1">
            <div className="flex items-center gap-4">
                <h2 className="text-cyan-700 font-medium text-xs">Teacher.React</h2>
                {auth.isAuthenticated && (
                    <Link 
                        className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded-full shadow-sm hover:shadow transition-all duration-200 transform hover:-translate-y-0.5 font-medium text-[10px]" 
                        to="/create-exam"
                    >
                        <MdPostAdd size={14} id="addExamButton"/> Create Exam
                    </Link>
                )}
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