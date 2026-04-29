import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css'
import RootLayout from "./routes/RootLayout.tsx";
import Exams from "./routes/Exams.tsx";
import NewExam from "./routes/NewExam.tsx";
import NewQuestion from "./routes/NewQuestion.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx"
import QuestionDetails from "./routes/QuestionDetails.tsx";
import {EnvProvider} from "./EnvProvider.tsx";
import {ExamProvider} from "./ExamProvider.tsx";
import { AuthProvider } from 'react-oidc-context';


const oidcConfig = {
    authority: import.meta.env.VITE_AUTHORITY,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri: window.location.origin,
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout/>,
        children: [
            {
                element: <ProtectedRoute allowedRoles={["teacher"]}/>,
                children: [
                    {
                        path: '/',
                        element: <Exams/>,
                        children: [
                            {
                                path: "/create-exam",
                                element: <NewExam/>,
                            }
                        ]
                    },
                    {
                        path: "/exam/:examId/addQuestion",
                        element: <NewQuestion/>,
                    },
                    {
                        path: "/exam/:examId/editQuestion/:questionId",
                        element: <QuestionDetails/>
                    }
                ]
            },
            {
                path: "/unauthorized",
                element: <div>You do not have teacher permissions.</div>
            }
        ]
    }
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider {...oidcConfig} >
            <EnvProvider>
                <ExamProvider>
                    <RouterProvider router={router}/>
                </ExamProvider>
            </EnvProvider>
        </AuthProvider>
    </StrictMode>,
)
