import ExamSelect from "./ExamSelect.tsx";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEnv } from "../EnvProvider.tsx";
import { useEffect, useState } from "react";
import type { ExamType } from "../types.ts";

const tabs = [
    { name: 'Exams', href: '/' },
    { name: 'Grades', href: '/grades' },
];

export default function MainView() {
    const env = useEnv()
    const [exams, setExams] = useState<ExamType[]>([])
    const [gradeNav, setGradeNav] = useState<boolean>(false)
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let ignore = false;

        const fetchExams = async () => {
            try {
                const response = await fetch(`${env.studentQueryAPIUrl}/api/v1/examView/${env.defaultStudentId}`);
                if (response.ok && response.status === 200) {
                    const resData = await response.json();
                    if (!ignore) {
                        console.log('-res', resData);
                        if (!location.state?.fromQuestion && resData.ExamInProcess) {
                            const { ExamSubmissionId, QuestionId } = resData.ExamInProcess
                            navigate(`/${ExamSubmissionId}/question/${QuestionId}`)
                        }
                        if (resData.StoredSubmissions) {
                            setGradeNav(true);
                        }
                        setExams(resData?.Exams || []);
                        if (location.state?.fromQuestion) {
                            navigate(location.pathname, { replace: true, state: {} });
                        }
                    }
                }
            } catch (error) {
                console.log('Fetch error:', error);
            }
        }

        fetchExams();
        return () => { ignore = true; };
    }, [location, navigate, env.studentQueryAPIUrl, env.defaultStudentId]);


    return (
        <>
            <Outlet />
            <div className="border-b border-gray-400 px-5">
                <nav id="tabs" className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.name}
                            to={tab.href}
                            onClick={(e) => tab.name == 'Grades' && !gradeNav && e.preventDefault()}
                            className={({ isActive }) => {
                                const baseClasses = "inline-flex items-center justify-center rounded-[4px] px-6 py-1 text-sm font-bold transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.2)]";

                                // Logic for Disabled state
                                if (tab.name === 'Grades' && !gradeNav) {
                                    return `${baseClasses} bg-gray-300  cursor-not-allowed pointer-events-none shadow-none opacity-70`;
                                }

                                // Logic for Active vs Inactive state
                                return `${baseClasses} ${isActive
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
            <main className="flex items-center justify-center flex-col">
                <ExamSelect exams={exams} />
            </main>
        </>
    )
}