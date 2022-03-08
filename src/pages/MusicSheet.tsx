import React, { useEffect } from 'react'
import * as d3 from 'd3'
import Sheet from './Sheet'
// approach: does not work if not using create-react-app
// import {ReactComponent as ReactLogo} from './letter-portrait.svg';

export interface MusicSheetProps {}
export interface MusicSheetState {}

/**
 * This will serve as the page where the music sheet will be generated and loaded onscreen.
 */

// breaks the rules of hooks (cannot call useEffect inside a component)
function createImage() {
    useEffect(() => {
    d3.xml("letter-portrait.svg")
        .then(data => {
            d3.select("#svg-container").node().append(data.documentElement)
        });
    });
}


export class MusicSheet extends React.Component<MusicSheetProps, MusicSheetState> {

    constructor(props : MusicSheetProps) {
        super(props)
    }

    componentDidMount(): void {
        // approach: no idea why this didn't work, but caused "you need to enable js" error
        // d3.xml("letter-portrait.svg")
        //     .then(data => {
        //         d3.select("#svg-container").node().append(data.documentElement)
        //     });
        console.log("mounted")
    }

    // approach: loads forever on the page with either
    // <img src="letter-portrait.svg"/>
    // <img src="https://raw.githubusercontent.com/dse/music-box-paper/f0b8a1415875c26771c547fc97701a46c577cfdf/15-note/letter-portrait.svg"/>
    public render() {
        return (
        <div id="svg-container">
            < Sheet />
        </div>)
    }

}