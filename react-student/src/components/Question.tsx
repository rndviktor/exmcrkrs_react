import {useEnv} from "../EnvProvider.tsx";
import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import type {AnswerType, QuestionType} from "../types.ts";
import Answer from "./Answer.tsx";
import classes from './Question.module.css';

export default function Question() {
    const env = useEnv()
    const navigate = useNavigate()
    const {submissionId, questionId} = useParams();
    const [question, setQuestion] = useState<QuestionType|null>(null)
    const [content, setContent] = useState('')
    const didFetchRef = useRef(false);
    const didLoadSubmittedRef = useRef(false);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])

    useEffect(() => {
        if (didFetchRef.current) return;
        const controller = new AbortController();
        
        const fetchQuestion = async (submissionId: string, questionId: string) => {
            const response = await fetch(`${env.studentQueryAPIUrl}/api/v1/questionView/${submissionId}/${questionId}`);
            if (response.ok && response.status === 200) {
                const resData = await response.json();
                setQuestion(resData.Question);
                
                const contentResponse = await fetch(`http://localhost:8080/assets/${resData.Question?.ContentUrl}`,
                    {
                        signal: controller.signal,
                    }    
                );
                
                if (!contentResponse.ok) {
                    setContent('content loading error')
                } else {
                    const data = await contentResponse.text();
                    setContent(extractBodyContent(data));
                }
                
                if (resData.QuestionSubmission?.SelectedAnswers) {
                    setSelectedAnswers(resData.QuestionSubmission?.SelectedAnswers);
                    didLoadSubmittedRef.current = true;
                }
                
            }
        }
        
        fetchQuestion(submissionId!, questionId!)
        return () => { didFetchRef.current = false; };
    }, [submissionId, questionId]);
    
    const onAnswerSelectionChange = (answerId: string)=> {
        const existing = selectedAnswers.find(x => x === answerId);
        if (existing) {
            const filteredAnswers = selectedAnswers.filter(x => x !== answerId);
            setSelectedAnswers(filteredAnswers);
        } else {
            setSelectedAnswers([...selectedAnswers, answerId])
        }
    }
    
    const handleNext = async() => {
        const selection = {
            QuestionId: question?.QuestionId,
            SelectedAnswers: Array.from(selectedAnswers),
            StudentId: env.defaultStudentId
        }
        
        let stringPath = "finishExam";
        let destination = "/";
        if (question?.NextQuestionId) {
            stringPath = "addQuestionSubmission"
            destination = `/${submissionId}/question/${question.NextQuestionId}`
            if(didLoadSubmittedRef.current) {
                stringPath = "editQuestionSubmission"
            }
        }

        const res = await fetch(`${env.studentWriteAPIUrl}/api/v1/${stringPath}/${submissionId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(selection),
        });
        
        if (res.ok && (res.status == 201||res.status == 200)) {
            didFetchRef.current = false;
            let options = {}
            if (destination === '/') {
                options = {state: {fromQuestion: true}}
            }
            navigate(destination, options);
        }
    }
    
    const handlePrev = async() => {
        didFetchRef.current = false;
        navigate(`/${submissionId}/question/${question?.PrevQuestionId}`)
    }
    
    return (<>
        <div className="whitespace-pre-line border-b-2 border-l-2 border-t-4 border-t-cyan-600 flex-1 mx-2"
            dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className="px-6">
            {question?.Answers?.map((answer: AnswerType) => (<Answer
                key={answer.AnswerId}
                answer={answer}
                onSelectChange={() => onAnswerSelectionChange(answer.AnswerId!)}
                checked={!!selectedAnswers.find(x => x == answer.AnswerId)}/>))}
        </div>
        <div className="flex flex-row justify-between my-10">
            <button className={classes.button} disabled={!question?.PrevQuestionId} onClick={handlePrev}>Prev</button>
            <button id="nextButton" className={classes.button} disabled={!selectedAnswers.length} onClick={handleNext}>{question?.NextQuestionId ? 'Next' : 'Finish'}</button>
        </div>
    </>)
}

const extractBodyContent = (html: string): string => {
    const bodyMatch = html.match(/<body[^>]*>((.|[\n\r])*)<\/body>/im);
    return bodyMatch ? bodyMatch[1] : html; // fallback to full html if no body found
}