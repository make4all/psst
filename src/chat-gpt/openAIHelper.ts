import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
export class OpenAIHelper {
    private configuration = new Configuration({
        // apiKey: p    rocess.env.EXPO_PUBLIC_OPENAI_API_KEY,

    });
    // });

    private messages: Array<ChatCompletionRequestMessage> = new Array();
    private openai: OpenAIApi;
    // console.log("API key")
    // console.log(process.env)
    

    constructor() {
        this.openai = new OpenAIApi(this.configuration);
        this.messages.push
            ({
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
                `}
            );
        
        // console.log("OpenAIHelper constructor invoked")
    }
    private promptBuilder(query:string) {

        // console.log(`performing llm operation ${op}`)

        



        this.messages.push({
            role: 'user',
            content: query
        });
        // console.log(canvasJson)
        // return messages;
    }

    public async requestOpenAI(query:string): Promise<string> {
        this.promptBuilder(query)
        const chatCompletion = await this.openai.createChatCompletion({
            model: "gpt-4",
            messages: this.messages,
        });
        console.log(chatCompletion.data.choices[0].message);
        let response: string = chatCompletion.data.choices[0].message?.content ? chatCompletion.data.choices[0].message.content
            : "no response generated";
        if (chatCompletion.data.choices[0].message) {
            this.messages.push(chatCompletion.data.choices[0].message)
        }
        return response
    }
}