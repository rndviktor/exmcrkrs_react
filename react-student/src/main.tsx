import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import RootLayout from "./routes/RootLayout.tsx";
import {EnvProvider} from "./EnvProvider.tsx";
import MainView from "./components/MainView.tsx";
import Question from "./components/Question.tsx";
import Grades from "./components/Grades.tsx";

const router = createBrowserRouter([{
    path: '/', element: <RootLayout/>, children: [
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
}])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <EnvProvider>
          <RouterProvider router={router}/>
      </EnvProvider>
  </StrictMode>,
)
