import type {ExamType} from "../types.ts";
import QuestionsList from "./QuestionsList.tsx";
import classes from "./Exam.module.css";
import {MdCancel, MdDelete, MdEdit, MdQuestionMark, MdOutlinePublishedWithChanges} from "react-icons/md";
import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import Confirm from "./Confirm.tsx";
import {GiConfirmed} from "react-icons/gi";
import {useEnv} from "../EnvProvider.tsx";
import {useExamContext} from "../ExamProvider.tsx";
import Publish from "./Publish.tsx";
import { useAuth } from "react-oidc-context";

export default function Exam({exam}: { exam: ExamType }) {
    const [showDelete, setShowDelete] = useState(false);
    const [isEditTitle, setIsEditTitle] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [title, setTitle] = useState(exam.Title);
    const navigate = useNavigate();
    const { removeExam } = useExamContext()
    const env = useEnv();
    const examId = `exam_${exam.ExamId}`
    const auth = useAuth();


    const handleDeletion = async () => {
        await fetch(`${env.teacherWriteAPIUrl}/api/v1/deleteExam/${exam.ExamId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${auth.user?.access_token}`
            },
            body: JSON.stringify({authorId: env.defaultTeacherId}),
        });
        
        removeExam(exam.ExamId!)

        setShowDelete(false);
        navigate('.')
    }

    const handleSubmit = async () => {
        await fetch(`${env.teacherWriteAPIUrl}/api/v1/editExamTitle/${exam.ExamId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${auth.user?.access_token}`
            },
            body: JSON.stringify({ title: title }),
        });

        setIsEditTitle(false)
    }
    const handleCancel = async () => {
        setShowDelete(false);
    }
    
    const handlePublish = async () => {
        const submitData = {authorId: env.defaultTeacherId};
        await fetch(`${env.publisherAPIUrl}/api/v1/publish/${exam.ExamId}`, {
            method: 'POST',
            body: JSON.stringify(submitData),
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${auth.user?.access_token}`
            },
        });
        
        setIsPublishing(true);
    }

    return (<>
        <div id={examId} className="flex flex-row items-center justify-between bg-white px-4 py-2 rounded shadow-sm mb-2 border border-gray-100">
            <div className="flex flex-row items-center gap-2 w-full">
                {!isEditTitle && (<><h2 className="text-xl font-semibold text-gray-800 flex-1">{title}</h2>
                    <button id="titleEdit" className={classes.smButton} onClick={() => setIsEditTitle(true)}>
                        <MdEdit size={18}/>
                    </button>
                </>)}
                {isEditTitle && (<>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button id="submitTitle" className={classes.smButton} onClick={handleSubmit}><GiConfirmed size={16}/></button>
                    <button className={classes.smButton} onClick={() => setIsEditTitle(false)}><MdCancel size={16}/>
                    </button>
                </>)}
            </div>
            {!isEditTitle && <button className={classes.smButton + " ml-2"} onClick={() => setShowDelete(true)}>
                <MdDelete size={18}/>
            </button>}
        </div>

        <QuestionsList examId={exam.ExamId} questions={exam.Questions}/>
        <div className="flex flex-row items-center gap-4 mt-4 w-full">
            <Link className={classes.button} to={`/exam/${exam.ExamId}/addQuestion`}>
                <MdQuestionMark size={18} id="addQuestionButton"/> Create Question
            </Link>
            {!isPublishing && <button id="publishExam" className={classes.button} onClick={handlePublish}>
                <MdOutlinePublishedWithChanges size={18}/> Publish Exam
            </button>}
            {isPublishing && <Publish examId={exam.ExamId!} onFinish={() => setIsPublishing(false)}/>}
        </div>

        <Confirm itemName="Exam" onConfirm={handleDeletion} onCancel={handleCancel} isOpen={showDelete}/>
    </>)
}