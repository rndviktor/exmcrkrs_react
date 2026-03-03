import {Link, useNavigate, useParams} from "react-router-dom";
import type {AnswerType, QuestionType} from "../types.ts";
import classes from "./QuestionDetails.module.css";
import {MdCancel, MdDelete, MdEdit, MdHome, MdQuestionAnswer} from "react-icons/md";
import {useEffect, useState} from "react";
import Answer from "../components/Answer.tsx";
import TextareaAutosize from "react-textarea-autosize";
import {GiConfirmed} from "react-icons/gi";
import Confirm from "../components/Confirm.tsx";
import {useEnv} from "../EnvProvider.tsx";
import {useExamContext} from "../ExamProvider.tsx";

export default function QuestionDetails() {
    const { exams, addOrUpdateQuestion, removeQuestion } = useExamContext()
    const {examId, questionId} = useParams();
    
    const [ question, setQuestion ] = useState<QuestionType|undefined|null>(null)
    
    useEffect(() => {
        const ex = exams.find(ex => ex.ExamId === examId);
        if (ex) {
            const q = ex.Questions.find(q => q.QuestionId === questionId);
            if (q) {
                setQuestion(q);
                setContent(q.Content)
            }
        }
    }, [exams, examId, questionId]);
    
    
    const [isContentEditing, setIsContentEditing] = useState(false)
    const [content, setContent] = useState<string|undefined|null>(null);
    const [isAnswerAdding, setIsAnswerAdding] = useState(false);
    
    const [showDelete, setShowDelete] = useState<boolean>(false);
    const navigate = useNavigate();
    const env = useEnv();

    const onAnswerListUpdated = async (answer: AnswerType) => {
        let answers: AnswerType[]|undefined = [];

        const updatedAnswer = question?.Answers ? question?.Answers?.find(a => a.AnswerId === answer.AnswerId): null;
        if (updatedAnswer) {
            answers = question?.Answers?.map(a => a.AnswerId === answer.AnswerId ? answer : a)
        } else {
            answers = question?.Answers ? [...question?.Answers, answer] : [answer];
        }
        const updateQ = {...question, Answers: answers}

        addOrUpdateQuestion(examId!, updateQ)
        setIsAnswerAdding(false);
    }

    const onAnswerDelete = async (answerId: string) => {
        question!.Answers = question?.Answers?.filter(a => a.AnswerId !== answerId);
        addOrUpdateQuestion(examId!, question!)
    }

    const handleContentSubmit = async () => {
        const submitQuestion: QuestionType = {
            ...question, Content: content
        };
        await fetch(`${env.teacherWriteAPIUrl}/api/v1/editQuestionContent/${examId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(submitQuestion),
        });
        
        addOrUpdateQuestion(examId!, submitQuestion)
        setIsContentEditing(false);
    }

    const handleDeletion = async () => {
        await fetch(`${env.teacherWriteAPIUrl}/api/v1/removeQuestion/${examId}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({questionId: questionId}),
        });
        removeQuestion(examId!, questionId!)
        navigate("/")
    }

    const handleCancel = async () => {
        setShowDelete(false);
    }

    return (<div className="px-4 w-full">
        <div className="flex flex-row items-center justify-between">
            <Link id="homeButton" className={classes.smButton} to="/"><MdHome size={18}/></Link>
            <button className={classes.smButton} onClick={() => setShowDelete(true)}>
                <MdDelete size={18}/>
            </button>
        </div>
        {!isContentEditing && (<div className="flex flex-row flex-1">
            <div className="whitespace-pre-line border-b-2 border-t-4 border-t-cyan-600 flex-1">{content}</div>
            <div className="flex flex-col">
                <button id="contentEdit" className={classes.smButton} onClick={() => setIsContentEditing(true)}><MdEdit size={18}/>
                </button>
            </div>
        </div>)}
        {isContentEditing && (<div className="flex flex-row flex-1">
            <TextareaAutosize className="whitespace-pre-line border-b-2 border-t-4 border-t-cyan-600 flex-1"
                              value={content || ""} onChange={e => setContent(e.target.value)}/>
            <div className="flex flex-col">
                <button id="questionContentSubmit" className={classes.smButton} onClick={handleContentSubmit}>
                    <GiConfirmed size={16}/>
                </button>
            </div>
            <div className="flex flex-col">
                <button className={classes.smButton} onClick={() => setIsContentEditing(false)}>
                    <MdCancel size={16}/>
                </button>
            </div>
        </div>)}
        {question?.Answers?.map((answer: AnswerType) => <Answer key={answer.AnswerId} examId={examId!} questionId={questionId!}
                                                                answer={answer} isEditable={true}
                                                                onSubmitted={onAnswerListUpdated}
                                                                onDismissed={() => setIsAnswerAdding(false)}
                                                                onDelete={onAnswerDelete}/>)}
        {!isAnswerAdding && (<button className={classes.button} onClick={() => setIsAnswerAdding(true)}>
            <MdQuestionAnswer size={18} id="addAnswerButton"/> Add Answer
        </button>)}
        {isAnswerAdding &&
            <Answer examId={examId!} questionId={questionId!} isEditable={true} onSubmitted={onAnswerListUpdated}
                    onDismissed={() => setIsAnswerAdding(false)}/>}

        <Confirm itemName="Question" onConfirm={handleDeletion} onCancel={handleCancel} isOpen={showDelete}/>
    </div>)
}