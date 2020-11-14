import React, { Component } from "react";

import { FirebaseContext, getFirebase } from "./Firebase";
import { withAuthentication } from "./Session";
import App from "./App";

const AppWithAuthentication = withAuthentication(() => <App />);
AppWithAuthentication.displayName = "AppWithAuthentication";

class AppWrapper extends Component {
  state = {
    firebase: null,
  };

  componentDidMount() {
    const app = import("firebase/app");
    const auth = import("firebase/auth");
    const firestore = import("firebase/firestore");

    Promise.all([app, auth, firestore]).then((values) => {
      const firebase = getFirebase(values[0].default);

      this.setState({ firebase });
    });
  }

  render() {
    return (
      <FirebaseContext.Provider value={this.state.firebase}>
        <AppWithAuthentication />
      </FirebaseContext.Provider>
    );
  }
}
AppWrapper.displayName = "AppWrapper";

export default AppWrapper;
