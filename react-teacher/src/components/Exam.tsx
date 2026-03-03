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

export default function Exam({exam}: { exam: ExamType }) {
    const [showDelete, setShowDelete] = useState(false);
    const [isEditTitle, setIsEditTitle] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [title, setTitle] = useState(exam.Title);
    const navigate = useNavigate();
    const { removeExam } = useExamContext()
    const env = useEnv();
    const examId = `exam_${exam.ExamId}`


    const handleDeletion = async () => {
        await fetch(`${env.teacherWriteAPIUrl}/api/v1/deleteExam/${exam.ExamId}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({authorId: env.defaultTeacherId}),
        });
        
        removeExam(exam.ExamId!)

        setShowDelete(false);
        navigate('.')
    }

    const handleSubmit = async () => {
        await fetch(`${env.teacherWriteAPIUrl}/api/v1/editExamTitle/${exam.ExamId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({authorId: env.defaultTeacherId, title: title}),
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
            }
        });
        
        setIsPublishing(true);
    }

    return (<>
        <div id={examId} className="flex flex-row items-center justify-between">
            <div className="flex flex-row">
                {!isEditTitle && (<><h2 className="text-2xl font-semibold underline flex-1">{title}</h2>
                    <button id="titleEdit" className={classes.smButton} onClick={() => setIsEditTitle(true)}>
                        <MdEdit size={18}/>
                    </button>
                    {!isPublishing && <button id="publishExam" className={classes.smButton} onClick={handlePublish}>
                        <MdOutlinePublishedWithChanges size={18}/>
                    </button>}
                    {isPublishing && <Publish examId={exam.ExamId!} onFinish={() => setIsPublishing(false)}/>}
                </>)}
                {isEditTitle && (<>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <button id="submitTitle" className={classes.smButton} onClick={handleSubmit}><GiConfirmed size={16}/></button>
                    <button className={classes.smButton} onClick={() => setIsEditTitle(false)}><MdCancel size={16}/>
                    </button>
                </>)}
            </div>
            {!isEditTitle && <button className={classes.smButton} onClick={() => setShowDelete(true)}>
                <MdDelete size={18}/>
            </button>}
        </div>

        <QuestionsList examId={exam.ExamId} questions={exam.Questions}/>
        <Link className={classes.button} to={`/exam/${exam.ExamId}/addQuestion`}>
            <MdQuestionMark size={18} id="addQuestionButton"/> Create Question
        </Link>

        <Confirm itemName="Exam" onConfirm={handleDeletion} onCancel={handleCancel} isOpen={showDelete}/>
    </>)
}