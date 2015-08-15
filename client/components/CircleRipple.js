import React from "react";
import mui from "material-ui";

const Colors = mui.Styles.Colors;

export function getRippleStyleFromTouchEvent(ev, el) {
    const style = {};
    const elHeight = el.offsetHeight;
    const elWidth = el.offsetWidth;
    const offset = mui.Utils.Dom.offset(el);
    const ne = ev.nativeEvent;
    const isTouchEvent = ne.changedTouches && ne.changedTouches.length;
    const pageX = isTouchEvent ? ne.changedTouches[0].pageX : ne.pageX;
    const pageY = isTouchEvent ? ne.changedTouches[0].pageY : ne.pageY;
    const pointerX = pageX - offset.left;
    const pointerY = pageY - offset.top;

    return getRippleStyleFromPosition(elWidth, elHeight, pointerX, pointerY);
}

export function getRippleStyleFromPosition(elWidth, elHeight, pointerX, pointerY) {
    const style = {};
    const topLeftDiag = calcDiag(pointerX, pointerY);
    const topRightDiag = calcDiag(elWidth - pointerX, pointerY);
    const botRightDiag = calcDiag(elWidth - pointerX, elHeight - pointerY);
    const botLeftDiag = calcDiag(pointerX, elHeight - pointerY);
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

function calcDiag(a, b) {
    return Math.sqrt((a * a) + (b * b));
}

export default class CircleRipple extends React.Component {
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
            mui.Styles.Transitions.easeOut(this.props.transitionLength, 'transform'),
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
    opacity: 0.16,
    transitionLength: "1s"
};
