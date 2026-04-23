import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import React from "react";
import type {
    ExamSubmissionsViewModel,
    QuestionCorrectness,
    QuestionSubmissionSelection,
    QuestionViewModel
} from "../types.ts";
import QuestionSubmissionView from "./QuestionSubmissionView.tsx";

export default function ExamSubmissionView({ submission, question }: { submission: ExamSubmissionsViewModel, question: QuestionViewModel }) {
    const [openedId, setOpenedId] = useState<string | null | undefined>(null);

    const toggle = (id: string | null | undefined) => {
        setOpenedId(openedId === id ? null : id);

    };

    const scoreMap = useMemo(() => {
        const map = new Map<string, string>();
        question?.Submissions?.forEach(s => {
            if (s.QuestionId && s.ScoreString) {
                map.set(s.QuestionId, s.ScoreString);
            }
        });
        return map;
    }, [question?.Submissions]);

    const selectionMap = useMemo(() => {
        const map = new Map<string, QuestionSubmissionSelection>();
        submission?.ExamSubmission?.QuestionsSubmissions?.forEach(sel => {
            if (sel.QuestionId) {
                map.set(sel.QuestionId, sel);
            }
        });
        return map;
    }, [submission?.ExamSubmission?.QuestionsSubmissions]);

    const correctnessMap = useMemo(() => {
        const map = new Map<string, QuestionCorrectness>();
        question?.Questions?.forEach(x => {
            if (x.QuestionId) {
                map.set(x.QuestionId, x);
            }
        });
        return map;
    }, [question?.Questions]);

    const getScoreString = (questionId: string): string | undefined => {
        return scoreMap.get(questionId);
    }

    const getSelection = (): QuestionSubmissionSelection => {
        return selectionMap.get(openedId!)!;
    }

    const getCorrectness = (): QuestionCorrectness => {
        return correctnessMap.get(openedId!)!;
    }

    return (
        <div className="divide-y divide-gray-200">
            {submission.Exam.Questions?.map((question) => {
                const id = question.QuestionId;
                const isOpen = openedId === id;

                return (
                    <React.Fragment key={id}>
                        {/* Accordion Header */}
                        <button
                            className={`w-full flex justify-between items-center p-4 text-left focus:outline-none transition-colors ${isOpen ? 'bg-gray-100' : 'bg-white'
                                }`}
                            onClick={() => toggle(id)}
                            aria-expanded={isOpen}
                        >
                            <span>
                                {id} -- {getScoreString(id!)}
                            </span>
                            <ChevronDown
                                className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {/* Accordion Content */}
                        <div
                            className={`p-4 bg-gray-50 text-gray-700 transition-all duration-300 ${!isOpen ? 'hidden' : ''
                                }`}
                        >
                            {isOpen && <QuestionSubmissionView question={question} selection={getSelection()} questionCorrectness={getCorrectness()} />}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}