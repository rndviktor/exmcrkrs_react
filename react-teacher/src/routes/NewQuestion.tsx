import {Form, Link, useNavigate, useParams} from "react-router-dom";
import classes from "./QuestionDetails.module.css";
import {MdHome} from "react-icons/md";
import {useExamContext} from "../ExamProvider.tsx";
import type {QuestionType} from "../types.ts";
import {useEffect, useState} from "react";
import {useEnv} from "../EnvProvider.tsx";
import QuestionContentEditor from "../components/QuestionContentEditor.tsx";

export default function NewQuestion() {
    const [content, setContent] = useState('')
    const { examId } = useParams();
    const { addOrUpdateQuestion } = useExamContext();
    const navigate = useNavigate();
    const env = useEnv();
    
    const submitData = async (data: string)=> {
        if (!data.length) return;
        
        const res = await fetch(`${env.teacherWriteAPIUrl}/api/v1/addQuestion/${examId}`, {
            method: 'PUT',
            body: JSON.stringify({content: data}),
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
    
    useEffect(() => {
        if (content.length) {
            submitData(content)
        }
    }, [content])
    
    return (<Form className="px-4 w-full">
        <div className="flex flex-row items-center justify-between">
            <Link className={classes.smButton} to="/"><MdHome size={18}/></Link>
        </div>
        <div className="flex flex-col flex-1">
            <QuestionContentEditor examId={examId!} content={content} createNew={true} onSubmit={(str: string) => {setContent(str)}}/>
        </div>
    </Form>)
}