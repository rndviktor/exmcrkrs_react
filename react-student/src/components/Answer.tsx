import type {AnswerType} from "../types.ts";

export default function Answer({answer, checked, onSelectChange}: {
    answer: AnswerType,
    onSelectChange: (answerId: string) => void,
    checked?: boolean}) {
    
    const idStr = `answer_${answer.AnswerId}`
    
    return (
        <div id={idStr} className="flex flex-row flex-1 border-b-1 border-b-gray-200 justify-between">
            <div className="flex flex-row justify-items-start" onClick={() => onSelectChange(answer.AnswerId!)}>
                <div>{checked ? '☑' : '☐'}</div>
                <div className="whitespace-pre-line px-2 font-thin">{answer.Content}</div>
            </div>
        </div>
    )
}