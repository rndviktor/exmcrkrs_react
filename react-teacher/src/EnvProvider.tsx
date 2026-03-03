import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface Env {
    teacherQueryAPIUrl: string;
    teacherWriteAPIUrl: string;
    publisherAPIUrl: string;
    defaultTeacherId: string;
}

const EnvContext = createContext<Env|null>(null);

interface EnvProviderProps {
    children: ReactNode;
}

const EnvProvider: React.FC<EnvProviderProps> = ({children}) => {
    const env = {
        teacherQueryAPIUrl: import.meta.env.VITE_TEACHER_QUERY_URL,
        teacherWriteAPIUrl: import.meta.env.VITE_TEACHER_WRITE_URL,
        publisherAPIUrl: import.meta.env.VITE_PUBLISHER_URL,
        defaultTeacherId: import.meta.env.VITE_TEACHER_ID,
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