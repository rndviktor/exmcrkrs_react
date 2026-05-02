import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import RootLayout from "./routes/RootLayout.tsx";
import {EnvProvider} from "./EnvProvider.tsx";
import MainView from "./components/MainView.tsx";
import Question from "./components/Question.tsx";
import Grades from "./components/Grades.tsx";
import ProtectedRoute from './routes/ProtectedRoute.tsx';
import { AuthProvider } from 'react-oidc-context';


const oidcConfig = {
    authority: import.meta.env.VITE_AUTHORITY,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri: window.location.origin,
}

const router = createBrowserRouter([{
    path: '/',
    children: [
        {
            element: <ProtectedRoute allowedRoles={['student']} />,
            children: [
                {
                    element: <RootLayout />,
                    children: [
                        {
                            path: '/',
                            element: <MainView/>,
                        },
                        {
                            path: '/:submissionId/question',
                            element: <Question/>
                        },
                        {
                            path: '/:submissionId/question/:questionId',
                            element: <Question/>
                        },
                        {
                            path: '/grades',
                            element: <Grades />
                        }
                    ]
                }
            ]
        },
        {
            path: '/unauthorized',
            element: <div>You do not have student permissions...</div>
        }
    ]
}])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <EnvProvider>
          <RouterProvider router={router}/>
      </EnvProvider>
    </AuthProvider>
  </StrictMode>,
)
