import {Form, Link, useNavigate, useParams} from "react-router-dom";
import classes from "./QuestionDetails.module.css";
import TextareaAutosize from 'react-textarea-autosize';
import {MdHome} from "react-icons/md";
import {GiConfirmed} from "react-icons/gi";
import {useExamContext} from "../ExamProvider.tsx";
import type {QuestionType} from "../types.ts";
import {useState} from "react";
import {useEnv} from "../EnvProvider.tsx";

export default function NewQuestion() {
    const [content, setContent] = useState('')
    const { examId } = useParams();
    const { addOrUpdateQuestion } = useExamContext();
    const navigate = useNavigate();
    const env = useEnv();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await fetch(`${env.teacherWriteAPIUrl}/api/v1/addQuestion/${examId}`, {
            method: 'PUT',
            body: JSON.stringify({content}),
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (res.ok && res.status === 201) {
            const resData = await res.json();
            const { Id } = resData
            const question = { QuestionId: Id, Content: content } as QuestionType
            addOrUpdateQuestion(examId!, question)
            navigate(`/exam/${examId}/editQuestion/${Id}`)
        } else {
            navigate('/'); 
        } 
    }
    
    return (<Form onSubmit={handleSubmit} className="px-4 w-full">
        <div className="flex flex-row items-center justify-between">
            <Link className={classes.smButton} to="/"><MdHome size={18}/></Link>
        </div>
        <div className="flex flex-row flex-1">
            <TextareaAutosize className="whitespace-pre-line border-b-2 border-t-4 border-t-cyan-600 flex-1"
                name="content" value={content} onChange={(e) => setContent(e.target.value)}/>
            <div className="flex flex-col">
                <button className={classes.smButton} id="questionContentSubmit">
                    <GiConfirmed size={16}/>
                </button>
            </div>
        </div>
    </Form>)
}