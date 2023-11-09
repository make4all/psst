import React, { useState, useEffect } from 'react'
import { OpenAIHelper } from '../chat-gpt/openAIHelper'

import { FunctionCall } from '../chat-gpt/openAIHelper'

const ChatInterface = () => {
    const [messages, setMessages] = useState<{ role: string; content: string | FunctionCall }[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const openAIHelper = new OpenAIHelper()

    const sendMessage = async () => {
        setIsLoading(true)

        const response = await openAIHelper.requestOpenAI(input)
        setIsLoading(false)

        if (response) {
            setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: response }])
        } else {
            setMessages([
                ...messages,
                { role: 'user', content: input },
                { role: 'assistant', content: 'Sorry, I could not understand your request.' },
            ])
        }
        setInput('')
    }

    useEffect(() => {
        const welcomeMessage = 'Hello, how can I assist you today?'
        setMessages([{ role: 'assistant', content: welcomeMessage }])
    }, [])

    return (
        <div style={{ fontFamily: 'Arial', padding: '10px' }}>
            <div style={{ marginBottom: '10px' }}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: '10px',
                            padding: '10px',
                            borderRadius: '5px',
                            color: 'white',
                            background: message.role === 'user' ? '#007bff' : '#6c757d',
                        }}
                    >
                        <strong>{message.role}:</strong>{' '}
                        {typeof message.content === 'string' ? (
                            message.content
                        ) : (
                            <div>
                                <h2>Function Call</h2>
                                <p>Name: {message.content.name}</p>
                                <pre>Arguments: {JSON.stringify(JSON.parse(message.content.arguments), null, 2)}</pre>
                            </div>
                        )}{' '}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ width: '70%', marginRight: '10px' }}
            />
            <button
                onClick={sendMessage}
                style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
            >
                Send
            </button>
            {isLoading && <div>Loading...</div>}
        </div>
    )
}

export default ChatInterface
