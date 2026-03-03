import Modal from "../components/Modal.tsx";
import {Form, Link, useNavigate} from "react-router-dom";
import classes from './NewExam.module.css';
import {useState} from "react";
import {useExamContext} from "../ExamProvider.tsx";
import type {ExamType} from "../types.ts";
import {useEnv} from "../EnvProvider.tsx";

export default function NewExam() {
    const [title, setTitle] = useState('')
    const { addExam } = useExamContext()
    const navigate = useNavigate();
    const env = useEnv();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title.trim()) return;
        
        const submitData = {Title: title, authorId: env.defaultTeacherId};
        const response = await fetch(`${env.teacherWriteAPIUrl}/api/v1/newExam`, {
            method: 'POST',
            body: JSON.stringify(submitData),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        setTitle("");
        const {Id: examId} = await response.json();
        const ex = { ExamId: examId, ...submitData, Version: 1, Questions: [] } as ExamType;
        addExam(ex)
        navigate('/')
    }
    
    return (
        <Modal>
            <Form onSubmit={handleSubmit} className={classes.form}>
                <p className="py-2">
                    <label htmlFor="title">Exam title</label>
                    <input type="text" id="titleEd" name="title" value={title} onChange={e => setTitle(e.target.value)} required/>
                </p>
                <p className={classes.actions}>
                    <Link type="button" to="/">Cancel</Link>
                    <button id="submitNameButton">Submit</button>
                </p>
            </Form>
        </Modal>
    )
}