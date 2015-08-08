import React from "react";
import mui from "material-ui";
import _ from "lodash";

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

class CircleRipple extends React.Component {
    componentWillAppear(callback) {
        this._initializeAnimation(callback);
    }
    componentWillEnter(callback) {
        this._initializeAnimation(callback);
    }
    componentDidAppear() {
        this._animate();
    }
    componentDidEnter() {
        this._animate();
    }
    componentWillLeave(callback) {
        let style = React.findDOMNode(this).style;
        style.opacity = 0;
        this._timeout = setTimeout(callback, 2000);
    }
    componentWillUnmount() {
        clearTimeout(this._timeout);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return this.props !== nextProps || this.state !== nextState;
    }
    render() {
        const {
            color,
            opacity,
            style,
            ...other,
            } = this.props;

        const mergedStyles = Object.assign({
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            borderRadius: '50%',
            backgroundColor: color,
            transition:
            mui.Styles.Transitions.easeOut('2s', 'opacity') + ',' +
            mui.Styles.Transitions.easeOut('1s', 'transform'),
        }, style);

        return (
            <div {...other} style={mergedStyles} />
        );
    }
    _animate() {
        let style = React.findDOMNode(this).style;
        mui.Styles.AutoPrefix.set(style, 'transform', 'scale(1)');
    }
    _initializeAnimation(callback) {
        let style = React.findDOMNode(this).style;
        style.opacity = this.props.opacity;
        mui.Styles.AutoPrefix.set(style, 'transform', 'scale(0)');
        setTimeout(callback, 0);
    }
}
CircleRipple.defaultProps = {
    color: Colors.darkBlack,
    opacity: 0.16
};

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

        let rippleGroup;
        if (hasRipples) {
            const mergedStyles = Object.assign({
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                overflow: 'hidden',
            }, style);

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
            <div onTouchTap={this._handleTap.bind(this)}>
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
        this.start(e.nativeEvent, true);
        setTimeout(() => {
            this.end();
        }, 0);
        if (this.props.onTouchTap) {
            this.props.onTouchTap(e);
        }
    }
    _getRippleStyle(e) {
        let style = {};
        const el = React.findDOMNode(this);
        const elHeight = el.offsetHeight;
        const elWidth = el.offsetWidth;
        const offset = mui.Utils.Dom.offset(el);
        const isTouchEvent = e.changedTouches && e.changedTouches.length;
        const pageX = isTouchEvent ? e.changedTouches[0].pageX : e.pageX;
        const pageY = isTouchEvent ? e.changedTouches[0].pageY : e.pageY;
        const pointerX = pageX - offset.left;
        const pointerY = pageY - offset.top;
        const topLeftDiag = this._calcDiag(pointerX, pointerY);
        const topRightDiag = this._calcDiag(elWidth - pointerX, pointerY);
        const botRightDiag = this._calcDiag(elWidth - pointerX, elHeight - pointerY);
        const botLeftDiag = this._calcDiag(pointerX, elHeight - pointerY);
        const rippleRadius = Math.max(
            topLeftDiag, topRightDiag, botRightDiag, botLeftDiag
        );
        const rippleSize = rippleRadius * 2;
        const left = pointerX - rippleRadius;
        const top = pointerY - rippleRadius;

        style.height = rippleSize + 'px';
        style.width = rippleSize + 'px';
        style.top = top + 'px';
        style.left = left + 'px';

        return style;
    }
    _calcDiag(a, b) {
        return Math.sqrt((a * a) + (b * b));
    }
}