import {createContext, type ReactNode, useContext, useEffect, useRef, useState} from "react";
import type {ExamType, QuestionType} from "./types.ts";
import {useEnv} from "./EnvProvider.tsx";

interface ExamState {
    exams: ExamType[];
    addExam: (exam: ExamType) => void;
    removeExam: (examId: string) => void;
    addOrUpdateQuestion: (examId: string, question: QuestionType) => void;
    removeQuestion: (examId: string, questionId: string) => void;
}

const ExamContext = createContext<ExamState|null>(null);

interface ExamProviderProps {
    children: ReactNode;
}
export const ExamProvider: React.FC<ExamProviderProps> = ({children}) => {
    const [exams, setExams] = useState<(ExamType)[]>([])
    const env = useEnv()
    
    const addExam = (exam: ExamType) => {
        setExams((prevExams) => [...prevExams, exam]);
    }
    
    const removeExam = (examId: string) => {
        const filteredExams = exams.filter(ex => ex.ExamId !== examId)
        setExams(filteredExams);
    }

    const didFetchRef = useRef(false);
    
    const addOrUpdateQuestion = (examId: string, question: QuestionType) => {
        let exam = exams.find(ex => ex.ExamId === examId)
        if (exam) {
            const existingQuestion = exam.Questions?.find(q => q.QuestionId === question.QuestionId);
            let questions: QuestionType[]|undefined = exam.Questions;
            if (!existingQuestion) {
                questions = [...questions, question]
            } else {
                questions = questions.map(q => q.QuestionId === question.QuestionId ? question : q)
            }
            exam = {...exam, Questions: questions};
            const newExams = exams.map(ex => ex.ExamId === examId ? exam! : ex)
            setExams(newExams)
        }
    }
    
    const removeQuestion = (examId: string, questionId: string) => {
        let exam = exams.find(ex => ex.ExamId === examId)
        if (exam) {
            exam.Questions = exam.Questions.filter(q => q.QuestionId !== questionId)
            const newExams = exams.map(ex => ex.ExamId === examId ? exam! : ex)
            setExams(newExams)
        }
    }
    
    useEffect(() => {
        if (didFetchRef.current) return;
        const fetchExams = async () => {
            try {
                const response = await fetch(`${env.teacherQueryAPIUrl}/api/v1/examLookup/byAuthorId/${env.defaultTeacherId}`);
                if (response.ok && response.status === 200) {
                    const resData = await response.json();
                    setExams(resData?.Exams || []);
                }
            } catch (error) {
                console.log('Fetch error:', error);
            }
        }
        
        fetchExams();
        return () => { didFetchRef.current = true; };
    }, [])
    
    
    return (
        <ExamContext.Provider value={{ exams, addExam, addOrUpdateQuestion, removeQuestion, removeExam }}>
            {children}
        </ExamContext.Provider>
    )
}

export const useExamContext = () => {
    const context = useContext(ExamContext);
    if (!context) {
        throw new Error('useExamContext must be used within an ExamProvider');
    }
    return context;
};