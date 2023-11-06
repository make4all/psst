const express = require('express')
const { OpenAI } = require('openai')

const app = express()
const cors = require('cors')
require('dotenv').config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
})

app.use(cors())
app.use(express.json())
app.use('/', express.static(__dirname + '/frontend')) // Serves resources from client folder

app.post('/get-prompt-result', async (req, res) => {
    // Get the prompt from the request body
    const { prompt, model = 'gpt' } = req.body

    // Check if prompt is present in the request
    if (!prompt) {
        // Send a 400 status code and a message indicating that the prompt is missing
        return res.status(400).send({ error: 'Prompt is missing in the request' })
    }

    try {
        let messages = []
        messages.push({
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
        messages.push({ role: 'user', content: `${prompt}` })
        // Use the OpenAI SDK to create a completion
        // with the given prompt, model and maximum tokens
        const chatCompletion = await openai.chat.completions.create({
            messages: messages,
            model: 'gpt-4',
        })

        let response = chatCompletion.choices[0].message?.content
            ? chatCompletion.choices[0].message.content
            : 'no response generated'
        return res.send(response)
    } catch (error) {
        const errorMsg = error.response ? error.response.data.error : `${error}`
        console.error(errorMsg)
        // Send a 500 status code and the error message as the response
        return res.status(500).send(errorMsg)
    }
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Listening on port ${port}`))
