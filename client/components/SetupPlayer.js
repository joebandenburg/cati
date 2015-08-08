import React from "react";
import mui from "material-ui";
import _ from "lodash";
import {isLarge, isXsmall, calcWidth, gutterWidth} from "../util/device";

const Colors = mui.Styles.Colors;
const TransitionGroup = React.addons.TransitionGroup;

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

class TapOnlyRipple extends React.Component {
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

class Title extends React.Component {
    constructor() {
        super();
        this.state = {
            appearing: false,
            entering: false,
            leaving: false
        };
    }
    componentWillAppear(callback) {
        this.setState({
            appearing: true
        });
        setTimeout(callback, 0);
    }
    componentDidAppear() {
        this.setState({
            appearing: false
        });
    }
    componentWillEnter(callback) {
        this.setState({
            entering: true
        });
        setTimeout(callback, 300);
    }
    componentDidEnter() {
        this.setState({
            entering: false
        });
    }
    componentWillLeave(callback) {
        this.setState({
            leaving: true
        });
        setTimeout(callback, 300);
    }
    render() {
        const style = {
            opacity: (this.state.appearing || this.state.entering || this.state.leaving) ? 0 : 1,
            display: "flex",
            position: "absolute",
            top: 0,
            left: (this.state.appearing) ? 24 : (this.state.entering) ? (this.props.fromRight) ? 58 : -10 : 24,
            transition: (this.state.entering) ? "none" : "opacity 0.3s, left 0.3s",
            boxSizing: "border-box"
        };
        return (
            <div style={style}>{this.props.children}</div>
        );
    }
}

class Page extends React.Component {
    constructor() {
        super();
        this.state = {
            entering: false,
            leaving: false
        };
    }
    componentWillAppear(callback) {
        this.setState({
            entering: true
        });
        setTimeout(callback, 600);
    }
    componentDidAppear() {
        this.setState({
            entering: false
        });
    }
    componentWillEnter(callback) {
        this.setState({
            entering: true
        });
        setTimeout(callback, 600);
    }
    componentDidEnter() {
        this.setState({
            entering: false
        });
    }
    componentWillLeave(callback) {
        this.setState({
            leaving: true
        });
        setTimeout(callback, 300);
    }
    render() {
        const style = Object.assign({
            opacity: (this.state.leaving || this.state.entering) ? 0 : 1,
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            top: this.state.entering ? 364 : 64,
            visibility: this.state.entering ? "hidden" : "visible",
            left: 0,
            width: "100%",
            minHeight: "calc(100% - 64px)",
            transition: this.state.entering ? "none" : "opacity 0.3s, top 0.3s",
            boxSizing: "border-box"
        }, this.props.style);
        return (
            <div style={style}>{this.props.children}</div>
        );
    }
}

class Box extends React.Component {
    constructor() {
        super();
        this.state = {
            hovered: false
        }
    }
    render() {
        const paperStyle = {
            backgroundColor: this.state.hovered ? this.props.hoverColor : this.props.backgroundColor,
            color: this.props.textColor,
            maxWidth: this.props.width,
            minHeight: 400,
            height: this.props.height,
            flexGrow: 1,
            flexShrink: 0,
            position: "relative",
            zIndex: this.state.hovered ? 5 : 0,
            cursor: "pointer"
        };
        const innerStyle = {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            boxSizing: "border-box",
            position: "absolute",
            height: "100%",
            width: "100%"
        };
        const iconStyle = {
            fontSize: 128
        };
        const h3Style = {
            fontSize: 24,
            marginTop: 16,
            lineHeight: 1.71429
        };
        const pStyle = {
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.71429,
            maxWidth: 400
        }
        const zDepth = this.state.hovered ? 3 : 0;
        return (
            <mui.Paper zDepth={zDepth}
                       style={paperStyle}
                       rounded={false}
                       onMouseOver={this._onMouseOver.bind(this)}
                       onMouseOut={this._onMouseOut.bind(this)}>
                <TapOnlyRipple color={this.props.textColor} onTouchTap={this.props.onTouchTap.bind(this)}>
                    <div style={innerStyle}>
                        <mui.FontIcon style={iconStyle} className="material-icons">{this.props.icon}</mui.FontIcon>
                        <h3 style={h3Style}>{this.props.title}</h3>
                        <p style={pStyle}>{this.props.text}</p>
                    </div>
                </TapOnlyRipple>
            </mui.Paper>
        );
    }
    _onMouseOver() {
        this.setState({
            hovered: true
        });
    }
    _onMouseOut() {
        this.setState({
            hovered: false
        });
    }
}

localStorage.removeItem("playerInfo");

export default class SetupPlayer extends React.Component {
    constructor() {
        super();
        this.state = {
            isPlayer: false,
            isSharedScreen: false
        };
    }
    componentWillMount() {
        this.context.muiTheme.setPalette({
            primary1Color: Colors.blueA200,
            accent1Color: Colors.blueA200,
            canvasColor: Colors.green400,
            textColor: Colors.darkWhite
        });
        this.context.muiTheme.setComponentThemes({
            textField: {
                hintColor: Colors.lightWhite,
                errorColor: Colors.orange100
            }
        });
    }
    onSelectPlayer(e) {
        e.preventDefault();
        setTimeout(() => {
            this.setState({
                isPlayer: true
            });
        }, 400);
    }
    onSelectSharedScreen(e) {
        e.preventDefault();
        setTimeout(() => {
            this.setState({
                isSharedScreen: true
            });
        }, 400);
    }
    onReset(e) {
        e.preventDefault();
        this.setState({
            isPlayer: false,
            isSharedScreen: false
        });
    }
    onGameOn(e) {
        e.preventDefault();
        if (this.state.isPlayer) {
            const errorText = this.validatePlayerName();
            if (!errorText) {
                this.props.onPlayerInfo({
                    type: "player",
                    name: this.state.playerName
                });
            }
        } else {
            this.props.onPlayerInfo({
                type: "sharedScreen"
            });
        }
    }
    onPlayerNameChange() {
        this.validatePlayerName();
    }
    validatePlayerName() {
        const playerName = this.refs.playerName.getValue();
        let errorText = undefined;
        if (playerName.length === 0) {
            errorText = "You need to enter a name.";
        } else if (playerName.length >= 25) {
            errorText = "Your name is too long.";
        } else if (!playerName.match(/^[a-zA-Z0-9 ]+$/)) {
            errorText = "Your name should only contain letters, numbers and spaces.";
        }
        this.setState({
            playerName,
            playerNameErrorText: errorText
        });
        return errorText;
    }
    render() {
        const xsmallDevice = isXsmall(this.context.windowWidth);
        const largeDevice = isLarge(this.context.windowWidth);
        const columns = xsmallDevice ? 2 : largeDevice ? 3 : 4;
        const pageWidth = calcWidth(this.context.windowWidth, columns * 2);
        const boxWidth = (xsmallDevice || pageWidth === "100%") ? undefined : pageWidth / 2;
        const boxHeight = xsmallDevice ? Math.min(this.context.windowWidth, 400) : boxWidth;
        const layout = xsmallDevice ? "column" : "row";
        const titleHeight = 64;
        let title;
        let page;
        if (this.state.isPlayer) {
            title = (
                <Title key="player">
                    <mui.IconButton style={{
                                        marginLeft: -16,
                                        marginRight: 8,
                                        marginTop: 8
                                    }}
                                    iconClassName="material-icons"
                                    onTouchTap={this.onReset.bind(this)}>
                        arrow_back
                    </mui.IconButton>
                    <h1 style={{
                            fontWeight: 400,
                            fontSize: 24,
                            lineHeight: "64px",
                            margin: 0,
                            padding: 0,
                            display: "inline-block"
                        }}>
                        Player
                    </h1>
                </Title>
            );
            page = (
                <Page key="player" style={{
                    backgroundColor: Colors.green400,
                    color: Colors.darkWhite,
                    flexGrow: 1,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                    <div style={{
                        width: pageWidth,
                        display: "flex",
                        flexDirection: "column",
                        padding: 24,
                        boxSizing: "border-box"
                    }}>
                        <h1>Hi</h1>
                        <p style={{
                        fontSize: 14,
                        fontWeight: 400,
                        lineHeight: 1.71429
                    }}>You need to enter a name so that other players know who you are.</p>
                        <mui.TextField ref="playerName"
                                       hintText="Name"
                                       fullWidth={true}
                                       style={{
                                       fontSize: 24
                                   }}
                                       value={this.state.playerName}
                                       errorText={this.state.playerNameErrorText}
                                       onChange={this.validatePlayerName.bind(this)}
                                       onEnterKeyDown={this.onGameOn.bind(this)} />
                        <mui.RaisedButton primary={true} style={{
                        alignSelf: "flex-end",
                        marginTop: 24
                    }} label="Game on" onTouchTap={this.onGameOn.bind(this)} />
                    </div>
                </Page>
            );
        } else if (this.state.isSharedScreen) {
            title = (
                <Title key="shared">
                    <mui.IconButton style={{
                                        marginLeft: -16,
                                        marginRight: 8,
                                        marginTop: 8
                                    }}
                                    iconClassName="material-icons"
                                    onTouchTap={this.onReset.bind(this)}>
                        arrow_back
                    </mui.IconButton>
                    <h1 style={{
                            fontWeight: 400,
                            fontSize: 24,
                            lineHeight: "64px",
                            margin: 0,
                            padding: 0,
                            display: "inline-block"
                        }}>
                        Shared screen
                    </h1>
                </Title>
            );
            page = (
                <Page key="shared" style={{
                    backgroundColor: Colors.brown400,
                    color: Colors.darkWhite,
                    flexGrow: 1,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                    <div style={{
                        width: pageWidth,
                        display: "flex",
                        flexDirection: "column",
                        padding: 24,
                        boxSizing: "border-box"
                    }}>
                        <h1>Wave, you're on TV</h1>
                        <p style={{
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: 1.71429
                        }}>This device will not participate in games as a player.</p>
                        <mui.RaisedButton primary={true}
                                          style={{
                                              alignSelf: "flex-end",
                                              marginTop: 24
                                          }}
                                          label="Continue"
                                          onTouchTap={this.onGameOn.bind(this)} />
                    </div>
                </Page>
            )
        } else {
            title = (
                <Title key="none" fromRight={true}>
                    <h1 style={{
                            fontWeight: 400,
                            fontSize: 24,
                            lineHeight: "64px",
                            margin: 0,
                            padding: 0,
                            display: "inline-block"
                        }}>
                        What device is this?
                    </h1>
                </Title>
            );
            page = (
                <Page key="none">
                    <div style={{
                        display: "flex",
                        flexDirection: layout,
                        justifyContent: "center",
                        marginTop: xsmallDevice ? 0 : largeDevice ? 64 : 32
                    }}>
                        <Box backgroundColor={Colors.green500}
                             hoverColor={Colors.green400}
                             textColor={Colors.darkWhite}
                             width={boxWidth}
                             height={boxHeight}
                             icon="phone_android"
                             title="Player"
                             text="This device will be used by you to play the game. You should be the only person who can see this screen."
                             onTouchTap={this.onSelectPlayer.bind(this)} />
                        <Box backgroundColor={Colors.brown500}
                             hoverColor={Colors.brown400}
                             textColor={Colors.darkWhite}
                             width={boxWidth}
                             height={boxHeight}
                             icon="tv"
                             title="Shared screen"
                             text="This device will be viewable by multiple players."
                             onTouchTap={this.onSelectSharedScreen.bind(this)} />
                    </div>
                </Page>
            );
        }
        return (
            <div>
                <mui.Paper zDepth={2} rounded={false} style={{
                    backgroundColor: this.state.isPlayer ? Colors.green500 : this.state.isSharedScreen ? Colors.brown500 : Colors.blue500,
                    color: Colors.darkWhite,
                    position: "fixed",
                    zIndex: 10,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    minHeight: titleHeight
                }}>
                    <div style={{
                        width: pageWidth,
                        position: "relative",
                        paddingLeft: 24,
                        paddingRight: 24,
                        boxSizing: "border-box"
                    }}>
                        <TransitionGroup transitionAppear={true}>
                            {title}
                        </TransitionGroup>
                    </div>
                </mui.Paper>
                <div>
                    <TransitionGroup>
                        {page}
                    </TransitionGroup>
                </div>
            </div>
        );
    }
}
SetupPlayer.contextTypes = {
    muiTheme: React.PropTypes.object,
    windowWidth: React.PropTypes.number
};