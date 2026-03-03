import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css'
import RootLayout from "./routes/RootLayout.tsx";
import Exams from "./routes/Exams.tsx";
import NewExam from "./routes/NewExam.tsx";
import NewQuestion from "./routes/NewQuestion.tsx";
import QuestionDetails from "./routes/QuestionDetails.tsx";
import {EnvProvider} from "./EnvProvider.tsx";
import {ExamProvider} from "./ExamProvider.tsx";

const router = createBrowserRouter([
    {
        path: '/', element: <RootLayout/>, children: [
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
    }
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <EnvProvider>
            <ExamProvider>
                <RouterProvider router={router}/>
            </ExamProvider>
        </EnvProvider>
    </StrictMode>,
)
