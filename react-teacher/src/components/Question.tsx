import type { AnswerType, QuestionType } from "../types.ts";
import Answer from "./Answer.tsx";
import { Link } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import classes from "./Question.module.css";

import React from "react";

const Question = ({ examId, question }: { examId: string | null, question: QuestionType }) => {
    const qId = `question_edit_${question.QuestionId}`
    return <>
        <div className="text-[10px] font-light text-gray-400 pl-1 leading-none mb-1">{question.QuestionId}</div>
        <div className="w-full flex flex-1 items-center gap-4 mb-2">
            <div className={classes.minimapContainer}>
                <div className={`whitespace-pre-line question-content ${classes.minimapContent}`}
                     dangerouslySetInnerHTML={{ __html: question.Content! }}
                />
            </div>
            <Link id={qId} className={classes.button} to={`/exam/${examId}/editQuestion/${question.QuestionId}`}>
                <MdEdit size={16} />
            </Link>
        </div>

        <div className="px-6">
            {question.Answers?.map((answer: AnswerType) => <Answer key={answer.AnswerId} examId={examId!} questionId={question.QuestionId!}
                answer={answer} />)}
        </div>
    </>
}

export default React.memo(Question);