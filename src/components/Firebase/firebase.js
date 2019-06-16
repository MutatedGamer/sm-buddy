import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';

export const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  calendarApiKey: process.env.REACT_APP_CALENDAR_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  clientId: process.env.REACT_APP_CLIENT_ID,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  scope: 'https://www.googleapis.com/auth/calendar',

  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
    ]
};

class Firebase {
  constructor() {
    app.initializeApp(config);

		this.auth = app.auth();
    this.db = app.firestore();
    this.initClient().then(gapi  => {
      this.gapi = gapi;
      console.log("HERE");
      console.log(this.gapi);
    });

    this.db.settings({
    });

    this.googleProvider = new app.auth.GoogleAuthProvider();
    this.googleProvider.addScope(config.scope);
  }

	// *** Auth API ***
	doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

	doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  async doSignInWithGoogle() {
   const googleAuth = this.gapi.auth2.getAuthInstance();
   const googleUser = await googleAuth.signIn();
   const token = googleUser.getAuthResponse().id_token;
   const credential = app.auth.GoogleAuthProvider.credential(token);
   this.auth.signInAndRetrieveDataWithCredential(credential);
  }

	doSignOut = () => this.auth.signOut();

	doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

	// *** User API ***
  addUser = (uid, username, email) =>
    this.db.collection("users").doc(uid).set({
      email: email,
      username: username
    });

  user = uid => this.db.collection("users").doc(uid);

  users = () => this.db.collection('users');

  async initClient() {
    let gapi = await require('google-client-api')()
    gapi.client.init({
      apiKey: config.calendarApiKey,
      clientId: config.clientId,
      scope: config.scope
    })
    return gapi;
  }

}

export default Firebase;
