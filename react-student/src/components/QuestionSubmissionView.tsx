import type { QuestionCorrectness, QuestionSubmissionSelection, QuestionType } from "../types.ts";
import { useEffect, useState } from "react";


export default function QuestionSubmissionView({ question, selection, questionCorrectness }: { question: QuestionType, selection: QuestionSubmissionSelection, questionCorrectness: QuestionCorrectness }) {
    const isChecked = (answerId: string) => {
        return selection?.SelectedAnswers.find(x => x == answerId) != null ? 'True' : '';
    }

    const isCorrect = (answerId: string) => {
        return questionCorrectness?.Answers.find(x => x.AnswerId == answerId)?.IsCorrect ? 'True' : '';
    }

    const [content, setContent] = useState('')

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        const fetchContent = async () => {
            try {
                const contentResponse = await fetch(`http://localhost:8080/assets/${question?.ContentUrl}`, {
                    signal: controller.signal,
                });
                if (!ignore) {
                    if (!contentResponse.ok) {
                        setContent('content loading error')
                    } else {
                        const data = await contentResponse.text();
                        setContent(extractBodyContent(data));
                    }
                }
            } catch (err) {
                console.log('Error fetching content:', err);
            }
        }
        fetchContent();
        return () => {
            ignore = true;
            controller.abort();
        };
    }, [question?.ContentUrl])

    return (<>
        <div className="whitespace-pre-line border-b-2 border-l-2 border-t-4 border-t-cyan-600 flex-1 mx-2"
            dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer
                            Content
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Checked
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Is
                            Correct
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {question.Answers?.map((item) => {
                        return (<tr key={item.AnswerId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.Content}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{isChecked(item.AnswerId!)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{isCorrect(item.AnswerId!)}</td>
                        </tr>)
                    })}
                </tbody>
            </table>
        </div>
    </>
    )
}

const extractBodyContent = (html: string): string => {
    const bodyMatch = html.match(/<body[^>]*>((.|[\n\r])*)<\/body>/im);
    return bodyMatch ? bodyMatch[1] : html; // fallback to full html if no body found
}