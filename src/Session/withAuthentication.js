import React from "react";
import PropTypes from "prop-types";

import AuthUserContext from "./context";
import Firebase, { withFirebase } from "../Firebase";

export const UpdateUserContext = React.createContext(null);

const withAuthentication = (Component) => {
  class WithAuthentication extends React.Component {
    _initFirebase = false;
    _isMounted = false;
    state = {
      authUser: null,
    };

    safeSetState = (state) => this._isMounted && this.setState(state);

    firebaseInit = () => {
      if (this.props.firebase && !this._initFirebase) {
        this._initFirebase = true;

        this.listener = this.props.firebase.onAuthUserListener(
          (authUser) => {
            localStorage.setItem("authUser", JSON.stringify(authUser));
            this.safeSetState({ authUser });
          },
          () => {
            localStorage.removeItem("authUser");
            this.safeSetState({ authUser: null });
          }
        );
      }
    };

    componentDidMount() {
      this._isMounted = true;
      this.safeSetState({
        authUser: JSON.parse(localStorage.getItem("authUser")),
      });

      this.firebaseInit();
    }

    componentDidUpdate() {
      this.firebaseInit();
    }

    componentWillUnmount() {
      this._isMounted = false;
      this.listener && this.listener();
    }

    updateAuthUser = () => {
      const { authUser } = this.state;
      if (authUser) {
        this.props.firebase
          .userAPIKey(authUser.uid)
          .get()
          .then((snapshot) => {
            if (snapshot.exists) {
              const apiKey = snapshot.data().value;
              const newAuthUser = {
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
                uid: authUser.uid,
                apiKey,
              };
              localStorage.setItem("authUser", JSON.stringify(newAuthUser));
              this.safeSetState({ authUser: newAuthUser });
            }
          })
          .catch(console.error);
      }
    };

    render() {
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <UpdateUserContext.Provider value={this.updateAuthUser}>
            <Component />
          </UpdateUserContext.Provider>
        </AuthUserContext.Provider>
      );
    }
  }

  WithAuthentication.displayName = "WithAuthentication";

  WithAuthentication.propTypes = {
    firebase: PropTypes.instanceOf(Firebase),
  };

  return withFirebase(WithAuthentication);
};

export default withAuthentication;
