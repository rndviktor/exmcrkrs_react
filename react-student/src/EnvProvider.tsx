import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface Env {
    studentQueryAPIUrl: string;
    studentWriteAPIUrl: string;
    evaluatorAPIUrl: string;
    defaultStudentId: string;
}

const EnvContext = createContext<Env|null>(null);

interface EnvProviderProps {
    children: ReactNode;
}

const EnvProvider: React.FC<EnvProviderProps> = ({children}) => {
    const env = {
        studentQueryAPIUrl: import.meta.env.VITE_STUDENT_QUERY_URL,
        studentWriteAPIUrl: import.meta.env.VITE_STUDENT_WRITE_URL,
        evaluatorAPIUrl: import.meta.env.VITE_EVALUATOR_URL,
        defaultStudentId: import.meta.env.VITE_STUDENT_ID,
    }
    
    return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>
}

const useEnv = (): Env => {
    const context = useContext(EnvContext);
    if (!context) {
        throw new Error('useEnv must be used within an EnvProvider');
    }
    return context;
};

export { EnvProvider, useEnv };