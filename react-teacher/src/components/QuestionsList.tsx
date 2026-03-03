import type {QuestionType} from "../types.ts";
import Question from "./Question.tsx";

export default function QuestionsList({examId, questions}: {examId: string|null, questions: QuestionType[]}) {
    return questions.map((question: QuestionType) => <Question key={question.QuestionId} examId={examId} question={question}/>)
}