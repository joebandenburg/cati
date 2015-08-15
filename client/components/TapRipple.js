import React from "react";
import mui from "material-ui";
import _ from "lodash";
import CircleRipple, {getRippleStyleFromTouchEvent} from "./CircleRipple";

const TransitionGroup = React.addons.TransitionGroup;
const Colors = mui.Styles.Colors;

function createChildren(fragments) {
    const newFragments = {};
    let validChildrenCount = 0;
    let firstKey;

    //Only create non-empty key fragments
    for (const key in fragments) {
        const currentChild = fragments[key];

        if (currentChild) {
            if (validChildrenCount === 0) firstKey = key;
            newFragments[key] = currentChild;
            validChildrenCount++;
        }
    }

    if (validChildrenCount === 0) return undefined;
    if (validChildrenCount === 1) return newFragments[firstKey];
    return React.addons.createFragment(newFragments);
}

export default class TapRipple extends React.Component {
    constructor() {
        super();
        this.state = {
            //This prop allows us to only render the ReactTransitionGroup
            //on the first click of the component, making the inital
            //render faster
            hasRipples: false,
            nextKey: 0,
            ripples: [],
        };
    }
    shouldComponentUpdate(nextProps, nextState) {
        return this.props !== nextProps || this.state !== nextState;
    }
    render() {
        const {
            children,
            style
            } = this.props;

        const {
            hasRipples,
            ripples,
            } = this.state;

        const mergedStyles = Object.assign({
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'hidden',
        }, style);

        let rippleGroup;
        if (hasRipples) {

            rippleGroup = (
                <TransitionGroup key="ripples" style={mergedStyles}>
                    {ripples}
                </TransitionGroup>
            );
        }

        const divChildren = createChildren({
            rippleGroup,
            children
        });

        return (
            <div onTouchTap={this._handleTap.bind(this)} style={mergedStyles}>
                {divChildren}
            </div>
        );
    }
    start(e, isRippleTouchGenerated) {
        let ripples = this.state.ripples;

        //Do nothing if we're starting a click-event-generated ripple
        //while having touch-generated ripples
        if (!isRippleTouchGenerated) {
            for (let i = 0; i < ripples.length; i++) {
                if (ripples[i].props.touchGenerated) return;
            }
        }

        //Add a ripple to the ripples array
        ripples = ripples.concat(
            <CircleRipple
                key={this.state.nextKey}
                style={!this.props.centerRipple ? this._getRippleStyle(e) : {}}
                color={this.props.color}
                opacity={this.props.opacity}
                touchGenerated={isRippleTouchGenerated} />
        );

        this.setState({
            hasRipples: true,
            nextKey: this.state.nextKey + 1,
            ripples
        });
    }
    end() {
        const currentRipples = this.state.ripples;
        this.setState({
            ripples: _.rest(currentRipples),
        });
    }
    _handleTap(e) {
        this.start(e, true);
        setTimeout(() => {
            this.end();
        }, 0);
        if (this.props.onTouchTap) {
            this.props.onTouchTap(e);
        }
    }
    _getRippleStyle(e) {
        const el = React.findDOMNode(this);
        return getRippleStyleFromTouchEvent(e, el);
    }
}
