import React from "react";

export default class CreateGame extends React.Component {
    componentDidMount() {
        fetch("/api/game", {
            method: "POST"
        }).then(res => res.json()).then(r => {
            this.context.router.replaceWith("/game/" + r.id);
        });
    }
    render() {
        return <div>Creating...</div>;
    }
}
CreateGame.contextTypes = {
    router: React.PropTypes.func.isRequired
};
