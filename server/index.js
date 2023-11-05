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
        // Use the OpenAI SDK to create a completion
        // with the given prompt, model and maximum tokens

        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: `Please reply below question in markdown format.\n ${prompt}` }],
            model: 'gpt-4',
        })

        // const completion = await openai.createCompletion({
        //     model: model === 'gpt' ? 'gpt-4' : 'code-davinci-002', // model name
        //     prompt: `Please reply below question in markdown format.\n ${prompt}`, // input prompt
        //     max_tokens: model === 'gpt' ? 8000 : 8000, // Use max 8000 tokens for codex model
        // })
        // Send the generated text as the response
        console.log(chatCompletion.choices)

        return res.send(chatCompletion.choices[0].message.content)
    } catch (error) {
        const errorMsg = error.response ? error.response.data.error : `${error}`
        console.error(errorMsg)
        // Send a 500 status code and the error message as the response
        return res.status(500).send(errorMsg)
    }
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Listening on port ${port}`))
