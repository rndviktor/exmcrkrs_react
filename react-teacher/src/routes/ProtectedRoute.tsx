import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Navigate, Outlet } from "react-router-dom";

const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const auth = useAuth()

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator) {
            auth.signinRedirect();
        }
    }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator, auth.signinRedirect]);

    if (auth.isLoading) {
        return <div>Loading authentication...</div>;
    }

    if (!auth.isAuthenticated) {
        return null;
    }

    const accessToken = auth.user?.access_token;
    const decodedToken = accessToken ? parseJwt(accessToken) : null;
    const userRoles: string[] = decodedToken?.realm_access?.roles || [];
    const hasAccess = allowedRoles.some(role => userRoles.includes(role));

    // console.log('---user', auth.user)

    return hasAccess ? <Outlet /> : <Navigate to="/unauthorized" />;
}

export default ProtectedRoute;