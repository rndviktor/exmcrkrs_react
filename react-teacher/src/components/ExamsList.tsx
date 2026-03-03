import type {ExamType} from "../types.ts";
import Exam from "./Exam.tsx";
import {useExamContext} from "../ExamProvider.tsx";

export default function ExamsList() {
    const { exams } = useExamContext();
    
    return (<>
        <div className="flex flex-1 flex-col px-3">
            {exams.length > 0 && (<ul>
                {exams.map((exam: ExamType) => <Exam key={exam.ExamId} exam={exam} />)}
            </ul>)}    
        </div>
        
    </>)
}