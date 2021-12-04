import React from 'react';
import { IDemoView } from './IDemoView';

export interface DemoSimpleState {};

export interface DemoSimpleProps {};

export class DemoSimple extends React.Component<DemoSimpleProps, DemoSimpleState> implements IDemoView {
    constructor(props: DemoSimpleProps) {
        super(props);
        this.state = {};
    }

    public onPlay = (data: any) => {

    }

    public onPause = (data: any) => {

    }

    public render() {
        return (
            <div>
                <p> press play to hear a simple sonification</p>
            </div>
        );
    }

    // componentDidMount() is invoked immediately after a component is mounted (inserted into the tree).
    // Initialization that requires DOM nodes should go here. If you need to load data from a remote endpoint,
    // this is a good place to instantiate the network request.
    public componentDidMount() {
        
    }

    // componentWillUnmount() is invoked immediately before a component is unmounted and destroyed.
    // Perform any necessary cleanup in this method, such as invalidating timers, canceling network requests,
    // or cleaning up any subscriptions
    public componentWillUnmount() {
        
    }
}