import { OpenAI } from 'openai'
import fs from 'fs'
import path from 'path'
import schema from './functions.json'

import { functionMap } from './DemoGPT'

import {
    createLanguageModel,
    createJsonTranslator,
    processRequests,
    TypeChatLanguageModel,
    TypeChatJsonTranslator,
} from 'typechat'
import { PSSTActions } from './PSSTActions/PSSTActionSchema'

export class OpenAIHelper {
    private messages = new Array()
    private openai: OpenAI
    private model: TypeChatLanguageModel
    private schema: string
    private translator: TypeChatJsonTranslator<PSSTActions>
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

        this.model = createLanguageModel(process.env)
        this.schema = fs.readFileSync(path.join(__dirname, './PSSTActions/PSSTActionSchema.ts'), 'utf8')

        this.translator = createJsonTranslator<PSSTActions>(this.model, this.schema, 'PSSTActions')
        this.translator.stripNulls = true

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

    public async requestOpenAI(query: string): Promise<OpenAI.Chat.Completions.ChatCompletion | undefined> {
        this.promptBuilder(query)

        this.openai.chat.completions.create
        const chatCompletion = await this.openai.chat.completions.create({
            messages: this.messages,
            model: 'gpt-4',
            functions: schema['functions'],
        })

        console.log(chatCompletion)

        let callFunction = functionMap[chatCompletion.choices[0].message?.function_call?.name ?? '']

        let json = chatCompletion.choices[0].message?.function_call?.arguments ?? undefined
        const parsedObject = JSON.parse(json || '{}')

        console.log(callFunction)
        console.log(parsedObject)

        if (callFunction === functionMap['createSonification']) {
            callFunction(
                parsedObject['handlerType'],
                parsedObject['outputType'],
                parsedObject['description'],
                parsedObject['max'],
                parsedObject['min'],
                parsedObject['interestPoints'],
                parsedObject['direction'],
            )
        }

        if (chatCompletion) return chatCompletion
    }

    public async typeChatRequest(query: string) {
        const response = await this.translator.translate(query)
        if (!response.success) {
            console.log(response.message)
            return
        }
        const psstActions = response.data
        console.log(JSON.stringify(psstActions, undefined, 2))
        if (psstActions.actions.some((item) => item.actionType === 'unknown')) {
            console.log("I didn't understand the following:")
            for (const action of psstActions.actions) {
                if (action.actionType === 'unknown') console.log(action.text)
            }
            return
        }
    }

    public async run_conversation(query: string): Promise<OpenAI.Chat.Completions.ChatCompletion | undefined> {
        this.promptBuilder(query)
        const tools = schema['functions']

        // Simulate the OpenAI client in TypeScript
        let response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: this.messages,
            tools: tools['functions'],
            tool_choice: 'auto', // auto is default, but we'll be explicit
        })

        console.log(response)

        let response_message = response.choices[0].message
        let tool_calls = response_message.tool_calls

        console.log(response_message)
        console.log(tool_calls)

        if (tool_calls) {
            let available_functions = functionMap

            this.messages.push({ response_message })

            for (let tool_call of tool_calls) {
                let function_name = tool_call.function.name
                let function_to_call = available_functions[function_name]
                let function_args = JSON.parse(tool_call.function.arguments)
                let function_response = function_to_call(function_args)
                this.messages.push({
                    tool_call_id: tool_call.id,
                    role: 'tool',
                    name: function_name,
                    content: function_response,
                })
            }
        }

        let second_response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: this.messages,
        })

        console.log(second_response)

        return second_response
    }
}
