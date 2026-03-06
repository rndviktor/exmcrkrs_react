import type { AnswerType } from "../types.ts";
import classes from "./Answer.module.css";
import { MdCancel, MdDelete, MdEdit } from "react-icons/md";
import { useState } from "react";
import { GiConfirmed } from "react-icons/gi";
import TextareaAutosize from "react-textarea-autosize";
import Confirm from "./Confirm.tsx";
import { useEnv } from "../EnvProvider.tsx";
import React from "react";

const Answer = ({ examId, questionId, answer, isEditable = false, onSubmitted, onDismissed, onDelete }: {
    examId: string,
    questionId: string,
    answer?: AnswerType,
    isEditable?: boolean,
    onSubmitted?: (ans: AnswerType) => void,
    onDismissed?: () => void,
    onDelete?: (answerId: string) => void,
}) => {
    const [isEdit, setIsEdit] = useState(!answer && isEditable);
    const [showDelete, setShowDelete] = useState<boolean>(false);
    const [isCorrect, setIsCorrect] = useState(answer?.IsCorrect || false);
    const [answerContent, setAnswerContent] = useState(answer?.Content || "");
    const env = useEnv();
    const ansId = `answer_${answer?.AnswerId}`;

    const handleSubmit = async () => {

        let urlPart = 'addAnswer'
        if (answer?.AnswerId) {
            urlPart = 'editAnswer'
        }

        let submitData = {
            QuestionId: questionId,
            Content: answerContent,
            IsCorrect: isCorrect
        } as AnswerType;
        if (answer) {
            submitData = { ...submitData, AnswerId: answer.AnswerId }
        }
        const response = await fetch(`${env.teacherWriteAPIUrl}/api/v1/${urlPart}/${examId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData),
        });

        if (response.ok && response.status == 201 && !answer) {
            const resData = await response.json();
            const { Id } = resData
            submitData.AnswerId = Id;
        }

        onSubmitted && onSubmitted(submitData);
        onDismissed && onDismissed();
        setIsEdit(false);
    }

    const handleDeletion = async () => {
        await fetch(`${env.teacherWriteAPIUrl}/api/v1/removeAnswer/${examId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId: questionId, answerId: answer!.AnswerId }),
        });

        onDelete && answer && onDelete(answer.AnswerId!)
    }

    const handleCancel = async () => {
        setShowDelete(false);
    }

    return <div id={ansId} className="flex flex-row flex-1 border-b-1 border-b-gray-200 justify-between">
        {answer && !isEdit && (<>
            <div className="flex flex-row justify-items-start">
                <div>{answer.IsCorrect ? '☑' : '☐'}</div>
                <div className="whitespace-pre-line px-2 font-thin">{answer.Content}</div>
            </div>
            {isEditable && (<div className="justify-end">
                <button id="editAnswer" className={classes.button} onClick={() => setIsEdit(true)}><MdEdit size={16} /></button>
                <button className={classes.button} onClick={() => setShowDelete(true)}><MdDelete size={16} />
                </button>
            </div>
            )}
        </>)}
        {isEdit && (<>
            <div className="flex flex-row justify-items-start flex-1">
                <input
                    className=""
                    type="checkbox"
                    checked={isCorrect}
                    id="IsCorrect"
                    onChange={e => setIsCorrect(e.target.checked)}
                />
                <TextareaAutosize className="flex-1 px-2" value={answerContent}
                    id="contentEd"
                    onChange={e => setAnswerContent(e.target.value)} />
            </div>
            <div className="justify-end">
                <button className={classes.button} onClick={handleSubmit} id="confirmAnswer"><GiConfirmed size={16} /></button>
                <button className={classes.button} onClick={() => {
                    onDismissed && onDismissed();
                    setIsEdit(false)
                }}><MdCancel size={16} /></button>
            </div>
        </>)}

        <Confirm itemName="Answer" onConfirm={handleDeletion} onCancel={handleCancel} isOpen={showDelete} />
    </div>
}

export default React.memo(Answer);