import type { AnswerType, QuestionType } from "../types.ts";
import Answer from "./Answer.tsx";
import { Link } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import classes from "./Question.module.css";

import React from "react";

const Question = ({ examId, question }: { examId: string | null, question: QuestionType }) => {
    const qId = `question_edit_${question.QuestionId}`
    return <>
        <div className="text-sm font-light text-gray-400">{question.QuestionId}</div>
        <div className="w-full flex flex-1">
            <div className="whitespace-pre-line border-b-2 border-l-2 border-t-4 border-t-cyan-600 flex-1">{question.Content}</div>
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