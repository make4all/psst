import React, {useState} from 'react'
import '../styles/keyboard.css'
export interface KeyProps {
    note : string
}

export interface KeyState {
}


export class Key extends React.Component<KeyProps, KeyState> {
    constructor(props : KeyProps) {
        super(props)
    }

    public render() {
        return (
            <div id={this.props.note} className="key">
            </div>
        )
    }
}