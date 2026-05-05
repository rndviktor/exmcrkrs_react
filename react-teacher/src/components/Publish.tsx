import {useEffect, useState} from "react";
import {useEnv} from "../EnvProvider.tsx";
import { useAuth } from "react-oidc-context";

export default function Publish ({examId, onFinish}:{examId:string, onFinish: () => void,}) {
    const [message, setMessage] = useState('');
    const env = useEnv();
    const auth = useAuth();
    
    useEffect(() => {
        const controller = new AbortController();


        const startStream = async () => {
            try {
                const response = await fetch(`${env.publisherAPIUrl}/api/v1/publish/${examId}/stream`, {
                    headers: {
                        'Authorization': `Bearer ${auth.user?.access_token}`,
                        'Accept': 'text/event-stream',
                    },
                    signal: controller.signal
                });
            
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const reader = response.body?.getReader();
                
                if (!reader) return;

                const decoder = new TextDecoder();

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });

                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data:')) {
                            const data = line.replace('data:', '').trim();
                            setMessage(data)
                        }
                    }
                }

                console.log('done publish');
                setTimeout(() => onFinish(), 3000);
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    console.log('Stream aborted');
                } else {
                    console.error('Stream error:', err);
                    // Handle error state here if needed
                }
            }
        }

        startStream()

        return () => {
            controller.abort(); // Cleans up the fetch request on unmount
        };
    }, [examId])
    
    return (
        <div id="publishingMessaging" className="flex-1 p-2 bg-gray-900 text-green-400 font-mono text-sm rounded-md shadow-inner border border-gray-700 flex items-center h-[38px]">
            &gt; {message || "Connecting to stream..."}
        </div>
    )
}