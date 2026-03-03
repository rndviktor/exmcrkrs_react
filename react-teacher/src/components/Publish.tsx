import {useEffect, useState} from "react";
import {useEnv} from "../EnvProvider.tsx";

export default function Publish ({examId, onFinish}:{examId:string, onFinish: () => void,}) {
    const [message, setMessage] = useState('');
    const env = useEnv();
    
    useEffect(() => {
        const eventSource = new EventSource(`${env.publisherAPIUrl}/api/v1/publish/${examId}/stream`);

        eventSource.onmessage = (event) => {
            setMessage(event.data);
        };
        eventSource.onerror = () => {
            console.log('done publish');
            eventSource.close();
            setTimeout(() => onFinish(), 3000)
        };

        return () => {
            eventSource.close();
        };
    }, [examId])
    
    return (<div id="publishingMessaging" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        {message}
    </div>)
}