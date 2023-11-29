import React, { useState, useEffect } from 'react'
import { OpenAIHelper } from '../chat-gpt/openAIHelper'
import { OpenAI } from 'openai'

const ChatInterface = () => {
    const [messages, setMessages] = useState<{ role: string; content: string | JSON }[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const openAIHelper = new OpenAIHelper()

    const sendMessage = async () => {
        setIsLoading(true)
        const response: OpenAI.Chat.Completions.ChatCompletion | undefined = await openAIHelper.requestOpenAI(input)
        await openAIHelper.typeChatRequest(input)
        setIsLoading(false)

        if (response) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'user', content: input },
                { role: 'assistant', content: response.choices[0].message.content },
                { role: 'function_call', content: response.choices[0].message?.function_call?.name ?? '' },
                {
                    role: 'arguments',
                    content: JSON.parse(response.choices[0].message?.function_call?.arguments || '{}'),
                },
            ])
        }
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
                        <strong>{message.role}:</strong> <pre>{JSON.stringify(message.content)}</pre>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex' }}>
                <textarea
                    id="message-input"
                    style={{ flex: '1', padding: '8px' }}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                ></textarea>
                <button
                    onClick={sendMessage}
                    style={{
                        padding: '8px',
                        background: '#4caf50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Send
                </button>
            </div>
            {isLoading && <div>Loading...</div>}
        </div>
    )
}

export default ChatInterface
