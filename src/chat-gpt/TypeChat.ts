import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { createLanguageModel, createJsonTranslator, processRequests } from 'typechat'
import { PSSTActions } from '../views/demos/PsstActionSchema'

// TODO: use local .env file.
dotenv.config({ path: path.join(__dirname, '../../../.env') })

const model = createLanguageModel(process.env)
const schema = fs.readFileSync(path.join(__dirname, '../views/demos/PsstActionSchema.ts'), 'utf8')
const translator = createJsonTranslator<PSSTActions>(model, schema, 'PSSTActions')
translator.validator.stripNulls = true

// Process requests interactively or from the input file specified on the command line
processRequests('📅> ', process.argv[2], async (request) => {
    const response = await translator.translate(request)
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
})
