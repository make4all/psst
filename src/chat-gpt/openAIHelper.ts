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
            model: 'gpt-4',
            functions: schema['functions'],
        })
        console.log(chatCompletion.choices[0].message)

        let callFunction = functionMap[chatCompletion.choices[0].message?.function_call?.name ?? '']

        let json = chatCompletion.choices[0].message?.function_call?.arguments ?? undefined
        const parsedObject = JSON.parse(json || '{}')

        console.log(callFunction)
        console.log(parsedObject)

        if (callFunction === undefined) return undefined

        if (callFunction === functionMap['sonify1D']) {
            callFunction(parsedObject['data'], parsedObject['sinkName'])
        }

        if (callFunction === functionMap['addSink']) {
            console.log(callFunction(parsedObject['description'], parsedObject['sinkId']))
        }

        if (callFunction === functionMap['getSink']) {
            console.log(callFunction(parsedObject['sinkId']))
        }

        if (callFunction === functionMap['deleteSink']) {
            callFunction(parsedObject['sinkId'])
        }

        let response = chatCompletion.choices[0].message?.function_call ?? undefined

        if (response) return response
    }

    public async run_conversation(query: string): Promise<FunctionCall | undefined> {
        this.promptBuilder(query)
        const tools = schema['functions']

        // Simulate the OpenAI client in TypeScript
        const client = {
            chat: {
                completions: {
                    create: async (params: any) => {
                        // Simulate the response from the OpenAI API
                        const response_message = params.messages[0]
                        const tool_calls = response_message.tool_calls

                        // Step 2: check if the model wanted to call a function
                        if (tool_calls) {
                            // Step 3: call the function
                            // Note: the JSON response may not always be valid; be sure to handle errors
                            const available_functions = {
                                addSink: functionMap['addSink'],
                                deleteSink: functionMap['deleteSink'],
                                sonify1D: functionMap['sonify1D'],
                                getSink: functionMap['getSink'],
                            } // only one function in this example, but you can have multiple
                            this.messages.push(response_message) // extend conversation with assistant's reply

                            // Step 4: send the info for each function call and function response to the model
                            for (const tool_call of tool_calls) {
                                const function_name = tool_call.function.name
                                const function_to_call = available_functions[function_name]
                                const function_args = JSON.parse(tool_call.function.arguments)
                                const function_response = function_to_call({
                                    location: function_args.location,
                                    unit: function_args.unit,
                                })
                                this.messages.push({
                                    tool_call_id: tool_call.id,
                                    role: 'tool',
                                    name: function_name,
                                    content: function_response,
                                }) // extend conversation with function response
                            }

                            // Simulate the second response from the OpenAI API
                            const second_response = await client.chat.completions.create({
                                model: 'gpt-3.5-turbo-1106',
                                prompt: {
                                    messages: this.messages,
                                },
                            })

                            return second_response
                        }
                    },
                },
            },
        }

        let response = client.chat.completions.create({
            model: 'gpt-3.5-turbo-1106',
            messages: this.messages,
            tools,
            tool_choice: 'auto', // auto is default, but we'll be explicit
        })

        console.log(response)

        return response
    }
}
