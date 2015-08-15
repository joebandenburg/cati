import React from "react";
import SetupDeviceSelection from "./SetupDeviceSelection";

const TransitionGroup = React.addons.TransitionGroup;

export default class SetupDevice extends React.Component {
    constructor() {
        super();
    }
    render() {
        const key = this.props.location.pathname;
        return (
            <TransitionGroup>
                {React.cloneElement(this.props.children || <SetupDeviceSelection location={this.props.location} />, { key })}
            </TransitionGroup>
        );
    }
}
SetupDevice.contextTypes = {
    muiTheme: React.PropTypes.object,
    windowWidth: React.PropTypes.number
};
