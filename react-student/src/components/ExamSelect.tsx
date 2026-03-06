import { useState, useCallback } from "react";
import { useEnv } from "../EnvProvider.tsx";
import classes from './Exams.module.css';
import { MdEdit } from "react-icons/md";
import type { ExamType, PaymentConfirmationSubmission } from "../types.ts";
import { PaymentConfirmation } from "./PaymentConfirmation.tsx";

export default function ExamSelect({ exams }: { exams: ExamType[] }) {
    const env = useEnv()
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
    const [pubKey, setPubKey] = useState("")
    const [errorMessage, setErrorMessage] = useState('')

    const handleStart = useCallback(async (submission: PaymentConfirmationSubmission) => {
        const response = await fetch(`${env.studentWriteAPIUrl}/api/v1/examStart/${env.defaultStudentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission),
        });

        if (response.ok && response.status == 201) {
            const resData = await response.json();
            console.log('-resStart', resData);
            if (resData.PaymentRequired) {
                setSelectedExamId(submission.ExamId)
                setPubKey(resData.PaymentRequired.PublishableKey)
                if (resData.PaymentRequired.Message) {
                    setErrorMessage(resData.PaymentRequired.Message)
                }
            }
            if (resData.SubmissionInProcess) {
                setTimeout(() => {
                    window.location.reload();
                }, 500)
            }
        }
    }, [env.defaultStudentId, env.studentWriteAPIUrl]);

    return (<>{exams && exams.map((exam: ExamType) => (<div key={exam.ExamId} className="flex flex-col">
        {exam.Title}, Version# {exam.Version}
        <button className={classes.button} onClick={() => handleStart({ ExamId: exam.ExamId! })}>
            <MdEdit size={28} /> Start Exam
        </button>
    </div>))}
        {!exams.length && (<>No exams found.</>)}

        <PaymentConfirmation
            examId={selectedExamId}
            publishableKey={pubKey}
            onCancel={() => setSelectedExamId(null)}
            onConfirmed={(c) => handleStart(c)}
            errorMessage={errorMessage}
        />
    </>)
}