const firebaseConfig = {
  apiKey: "AIzaSyBZhKH2gijNvbSJivg_SbrQ2mMm9Z7MIc0",
  authDomain: "smmry-client.firebaseapp.com",
  databaseURL: "https://smmry-client.firebaseio.com",
  projectId: "smmry-client",
  storageBucket: "smmry-client.appspot.com",
  messagingSenderId: "166895496160",
  appId: "1:166895496160:web:4e1af8b68c1aa8856c1985",
};

class Firebase {
  constructor(app) {
    app.initializeApp(firebaseConfig);
    this.auth = app.auth();
    this.firestore = app.firestore();
    this.provider = new app.auth.GoogleAuthProvider();
  }

  // *** Auth API ***
  doSignIn = () => firebase.auth.signInWithPopup(this.provider);

  doSignOut = () =>
    this.auth.signOut().then(() => localStorage.removeItem("authUser"));

  // *** Merge Auth and DB User API ***
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.userAPIKey(authUser.uid)
          .get()
          .then((snapshot) => {
            if (snapshot.exists) {
              const apiKey = snapshot.data().value;
              next({
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
                uid: authUser.uid,
                apiKey,
              });
            } else {
              this.userAPIKey(authUser.uid)
                .set({ value: "" })
                .then(() => {
                  next({
                    displayName: authUser.displayName,
                    photoURL: authUser.photoURL,
                    uid: authUser.uid,
                    apiKey: "",
                  });
                })
                .catch(console.error);
            }
          })
          .catch(console.error);
      } else {
        fallback();
      }
    });

  userAPIKey = (uid) => this.firestore.doc(`apikeys/${uid}`);
}

let firebase;
export const getFirebase = (app) => {
  if (!firebase) {
    firebase = new Firebase(app);
  }

  return firebase;
};

export default Firebase;
