import React from 'react'
export interface KeyboardProps {}
export interface KeyboardState {}

export class Keyboard extends React.Component<KeyboardProps, KeyboardState> {

    constructor(props : KeyboardProps) {
        super(props)
    }

    keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        console.log("key pressed!")
        document.querySelector("p")!.textContent = event.code
    }

    public render() {
        return (
            <div tabIndex={0} onKeyPress={this.keyDownHandler}>
                <p>hello</p>
            </div>
        )
    }

}