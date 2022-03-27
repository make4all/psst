import React from 'react'
import { NoteSonify } from '../sonification/output/NoteSonify'
import { SimpleDataHandler } from '../sonification/handler/SimpleDataHandler'
import '../styles/keyboard.css'
import { getKeyFreq } from '../sonification/OutputConstants'

export interface KeyboardProps {}
export interface KeyboardState {
    musicHandler: SimpleDataHandler
}

export class Keyboard extends React.Component<KeyboardProps, KeyboardState> {

    private _currPressed : string

    constructor(props : KeyboardProps) {
        super(props)
        this.state = {
            musicHandler : new SimpleDataHandler(new NoteSonify())
        }
        this._currPressed = ''
    }

    componentDidMount(): void {
        console.log("mounted")
    }

    handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        console.log("key pressed!")
        let pressedKey = event.code;
        document.querySelector("p")!.textContent = event.code
        // this is where the stream comes into play
    }

    public render() {
        return (
            <div id="piano" tabIndex={0} onKeyPress={this.handleKeyPress}>
                <p>Click me to start.</p>
            </div>
        )
    }

}