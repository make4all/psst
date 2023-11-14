import { OpenAI } from 'openai'

import schema from './functions.json'

import { functionMap } from '../views/demos/DemoGPT'

export interface FunctionCall {
    // Define the properties of the returned JSON here
    arguments: string
    name: string
    // etc.
}

export class OpenAIHelper {
    private messages = new Array()
    private openai: OpenAI

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.REACT_APP_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true,
        })
        this.messages.push({
            role: 'system',
            content: `
                You are an assistant and your job is to help create audio representations of data.
                To do this, you will use functions from the PSST toolkit, which is a library of data handlers (tools that manipulate data), and data outputs (tools that output data through audio or speech).
                You will be given information about where the data is generated from, and a goal that the user wants to achieve with the audio representation you will help create.
                example sources of the data can be accelerometer data, demographic data, and data sets from other large projects.
some general rools to keep in mind:
1. continuous audio output generally helps convey trends. a user can not process more than 2 simultaneous audio sources.
2. speech output helps convey precise data points. abundance of speech can cause cognitive overload so these should be used wisely.
3. extrema handlers can help communicate the limits of values.
4. slope handlers can help convey change in trends.
                `,
        })

        // console.log("OpenAIHelper constructor invoked")
    }

    private promptBuilder(query: string) {
        // console.log(`performing llm operation ${op}`)

        this.messages.push({
            role: 'user',
            content: query,
        })
        // console.log(canvasJson)
        // return messages;
    }

    public async requestOpenAI(query: string): Promise<FunctionCall | undefined> {
        this.promptBuilder(query)

        this.openai.chat.completions.create
        const chatCompletion = await this.openai.chat.completions.create({
            messages: this.messages,
            model: 'gpt-3.5-turbo',
            functions: schema['functions'],
        })
        console.log(chatCompletion.choices[0].message)

        let callFunction = functionMap[chatCompletion.choices[0].message?.function_call?.name ?? '']

        let json = chatCompletion.choices[0].message?.function_call?.arguments ?? undefined
        const parsedObject = JSON.parse(json || '{}')

        console.log(callFunction)
        console.log(parsedObject)

        callFunction(parsedObject['data'], parsedObject['sinkName'])

        let response = chatCompletion.choices[0].message?.function_call ?? undefined

        if (response) return response
    }
}
