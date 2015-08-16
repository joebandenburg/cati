import React from "react";
import mui from "material-ui";

const Colors = mui.Styles.Colors;

export default class CreateGame extends React.Component {
    componentWillMount() {
        this.context.muiTheme.setPalette({
            primary1Color: Colors.blue500,
            textColor: Colors.darkWhite
        });
    }
    componentDidMount() {
        fetch("/api/game", {
            method: "POST"
        }).then(res => res.json()).then(r => {
            this.context.router.replaceWith("/game/" + r.id);
        });
    }
    render() {
        return (
            <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors.blue500,
                color: Colors.darkWhite
            }}>
                <mui.CircularProgress mode="indeterminate" size={2} color={Colors.darkWhite} />
            </div>
        );
    }
}
CreateGame.contextTypes = {
    muiTheme: React.PropTypes.object,
    router: React.PropTypes.object
};
