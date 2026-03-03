import {Link, Outlet} from "react-router-dom";
import ExamsList from "../components/ExamsList.tsx";
import classes from './Exams.module.css';
import {MdPostAdd} from "react-icons/md";

export default function Exams() {
    return <>
        <Outlet/>
        <main className="flex items-center justify-center flex-col">
            <div className="w-full">
                <ExamsList/>
            </div>
            <Link className={classes.button} to="/create-exam">
                <MdPostAdd size={28} id="addExamButton"/> Create Exam
            </Link>
        </main>
    </>
}