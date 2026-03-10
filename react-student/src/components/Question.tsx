import { useEnv } from "../EnvProvider.tsx";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { AnswerType, QuestionType } from "../types.ts";
import Answer from "./Answer.tsx";
import classes from './Question.module.css';

export default function Question() {
    const env = useEnv()
    const navigate = useNavigate()
    const { submissionId, questionId } = useParams();
    const [question, setQuestion] = useState<QuestionType | null>(null)
    const [content, setContent] = useState('')
    const didFetchRef = useRef(false);
    const didLoadSubmittedRef = useRef(false);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        const fetchQuestion = async (submissionId: string, questionId: string) => {
            try {
                const response = await fetch(`${env.studentQueryAPIUrl}/api/v1/questionView/${submissionId}/${questionId}`, { signal: controller.signal });
                if (response.ok && response.status === 200) {
                    const resData = await response.json();
                    if (!ignore) setQuestion(resData.Question);

                    const contentResponse = await fetch(`http://localhost:8080/assets/${resData.Question?.ContentUrl}`, {
                        signal: controller.signal,
                    });

                    if (!ignore) {
                        if (!contentResponse.ok) {
                            setContent('content loading error');
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
            } catch (err) {
                console.log(err);
            }
        };

        fetchQuestion(submissionId!, questionId!);
        return () => {
            ignore = true;
            controller.abort();
        };
    }, [submissionId, questionId, env.studentQueryAPIUrl]);

    const onAnswerSelectionChange = useCallback((answerId: string) => {
        setSelectedAnswers(prev => {
            const existing = prev.find(x => x === answerId);
            if (existing) {
                return prev.filter(x => x !== answerId);
            }
            return [...prev, answerId];
        });
    }, []);

    const handleNext = async () => {
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
            if (didLoadSubmittedRef.current) {
                stringPath = "editQuestionSubmission"
            }
        }

        const res = await fetch(`${env.studentWriteAPIUrl}/api/v1/${stringPath}/${submissionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selection),
        });

        if (res.ok && (res.status == 201 || res.status == 200)) {
            didFetchRef.current = false;
            let options = {}
            if (destination === '/') {
                options = { state: { fromQuestion: true } }
                setTimeout(() => navigate(destination, options), 100)
            } else {
                navigate(destination, options);    
            }
        }
    }

    const handlePrev = async () => {
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
                checked={!!selectedAnswers.find(x => x == answer.AnswerId)} />))}
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