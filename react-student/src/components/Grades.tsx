import {NavLink, Outlet} from "react-router-dom";
import { ChevronDown } from 'lucide-react';
import {useEffect, useRef, useState} from "react";
import {useEnv} from "../EnvProvider.tsx";
import type {ExamSubmissionsViewModel, ExamSubmissionType, QuestionViewModel} from "../types.ts";
import React from "react";
import ExamSubmissionView from "./ExamSubmissionView.tsx";

const scorePercentString = (score: number) => {
    const percent = score * 100;
    const scoreNumb = Number.isInteger(percent) ? percent : percent.toFixed(1);
    return `${scoreNumb}%`;
}

const formatDateTime = (date: Date)=> {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function Grades() {
    const env = useEnv()
    const tabs = [
        {name: 'Exams', href: '/'},
        {name: 'Grades', href: '/grades'},
    ];

    const [openId, setOpenId] = useState<string|null>(null);

    const didFetchRef = useRef(false);
    
    const [submissions, setSubmissions] = useState<ExamSubmissionsViewModel[]>([])
    const [question, setQuestion] = useState<QuestionViewModel|null>(null);

    const toggle = async (id: string) => {
        setOpenId(openId === id ? null : id);
        
        const updateSubms = submissions.map(x => { return x.ExamSubmission.ExamSubmissionId === id ?
            {...x, ExamSubmission: {...x.ExamSubmission, IsShown: true}}
            : x } );
        
        setSubmissions(updateSubms);
        
        try {
            const response = await fetch(`${env.evaluatorAPIUrl}/api/v1/correctness/${env.defaultStudentId}/submissions/${id}`);
            if (response.ok && response.status === 200) {
                const resData = await response.json() as QuestionViewModel
                resData.Submissions = resData.Submissions.map(sub => {return {...sub, ScoreString: scorePercentString(sub.Score)}})
                setQuestion(resData)
            }
            
        } catch (error) {
            console.log('Fetching submission from evaluator error:', error);
        }
    };

    useEffect(() => {
        if (didFetchRef.current) return;

        const fetchGrades = async () => {
            try {
                const response = await fetch(`${env.studentQueryAPIUrl}/api/v1/submissionView/${env.defaultStudentId}`);
                if (response.ok && response.status === 200) {
                    const resData = await response.json() as ExamSubmissionsViewModel[];
                    
                    const updated = resData.map(es => {
                        return {
                            ...es,
                            ExamSubmission: {
                                ...es.ExamSubmission, EndDate: new Date(es.ExamSubmission.FinishDate!)
                            }
                        } });
                    
                    const evalResponse = await fetch(`${env.evaluatorAPIUrl}/api/v1/submissions/${env.defaultStudentId}`)
                    if (evalResponse.ok) {
                        const evalResData = await evalResponse.json() as ExamSubmissionType[];
                        
                        evalResData.map(item => {
                            const subm = updated.find(x => x.ExamSubmission.ExamSubmissionId === item.ExamSubmissionId);
                            if (subm) {
                                subm.ExamSubmission.Score = item.Score;
                                subm.ExamSubmission.ScoreString = scorePercentString(item.Score!)
                                subm.ExamSubmission.IsShown = item.IsShown;
                            }
                        })
                    }
                    setSubmissions(updated)
                }
            } catch (error) {
                console.log('Fetch error:', error);
            }
        }
        
        fetchGrades();

        return () => { didFetchRef.current = true; };
    }, [])
    
    
    return (<>
        <Outlet/>
        <div className="border-b border-gray-400 px-5">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.name}
                        to={tab.href}
                        className={({ isActive }) => {
                            const baseClasses = "inline-flex items-center justify-center rounded-[4px] px-6 py-1 text-sm font-bold transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.2)]";

                            // Logic for Active vs Inactive state
                            return `${baseClasses} ${
                                isActive
                                    ? 'bg-[#598392] text-[#2a2630]'
                                    : 'bg-[#aec3b0] text-[#2a2630] hover:bg-[#aec3b0]'
                            }`;
                        }}
                    >
                        {tab.name}
                    </NavLink>
                ))}
            </nav>
        </div>

        {submissions.map((sub) => {
            const {ExamSubmission, Exam} = sub
            const id = ExamSubmission.ExamSubmissionId;
            const isOpen = openId === id;
            
            return (<React.Fragment key={id}>
                <button
                    className={`w-full flex justify-between items-center p-4 text-left focus:outline-none transition-colors ${
                        isOpen ? 'bg-gray-100' : 'bg-white'
                    }`}
                    onClick={() => toggle(id!)}
                    aria-expanded={isOpen}
                >
                    <span>
                {`${Exam.Title} v${Exam.Version} `}
                        {formatDateTime(ExamSubmission.EndDate!)}
                        {` -- ${ExamSubmission.ScoreString}`}
              </span>
                    <div>
                        <ChevronDown
                            className={`w-5 h-5 transition-transform duration-300 ${
                                isOpen ? 'rotate-180' : ''
                            } ${
                                !ExamSubmission.IsShown ? 'text-red-600' : 'text-gray-600'
                            }`}
                        />
                    </div>
                </button>

                {isOpen && (
                    <div id="submission" className="p-4 bg-gray-50 text-gray-700 transition-all duration-300">
                        <ExamSubmissionView submission={sub} question={question!}></ExamSubmissionView>
                    </div>
                )}
            </React.Fragment>)
        })}
    </>)
}