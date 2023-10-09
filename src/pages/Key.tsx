import React from 'react'
import '../styles/keyboard.css'
export interface KeyProps {
    keyb : string,
    black : boolean,
    leftAdjust : number
}

export interface KeyState {
    class : string
}


export class Key extends React.Component<KeyProps, KeyState> {
    constructor(props : KeyProps) {
        super(props);
        this.state = {
            class : this.props.black ? "key black" : "key white"
        }
    }

    public render() {
        const left = {
            left : this.props.leftAdjust
        } as const;
        return (
            <div id={this.props.keyb} className={this.state.class} style={left}>
            </div>
        )
    }
}