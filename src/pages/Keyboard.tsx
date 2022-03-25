import React from 'react'
import '../styles/keyboard.css'
export interface KeyboardProps {}
export interface KeyboardState {}

export class Keyboard extends React.Component<KeyboardProps, KeyboardState> {

    constructor(props : KeyboardProps) {
        super(props)
    }

    componentDidMount(): void {
        console.log("mounted")
        document.addEventListener('keydown', () => this.keyDownHandler)
    }

    keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        console.log("key down!")
        document.querySelector("p")!.textContent = event.code
    }

    public render() {
        return (
            <div id="piano" tabIndex={0} onKeyDown={this.keyDownHandler}>
                <p>Click me to start.</p>
            </div>
        )
    }

}