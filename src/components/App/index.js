import React from 'react';
import {
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';

import createHistory from "history/createBrowserHistory"

import Navigation from '../Navigation';
import LandingPage from '../Landing';
import SignInPage from '../SignIn';
import GoogleSignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import HomePage from '../Home';
import PlaysPage from '../Plays';
import PlayPage from '../Play';
import AddPlayPage from '../AddPlay';
import EditPlayPage from '../EditPlay';
import AddConflictPage from '../AddConflict';
import { Container, Row, Col} from 'react-bootstrap';

import * as ROUTES from '../../constants/routes';
import { withAuthentication } from '../Session';

const App = () => (
  <Router history = {createHistory}>
    <div>
      <Navigation />
      <Container fluid={true} className="p-2">
        <Row>
          <Col>
            <Switch>
            <Route exact path={ROUTES.LANDING} component={LandingPage} />
            <Route exact path={ROUTES.SIGN_IN} component={SignInPage} />
            <Route exact path={ROUTES.GOOGLE_SIGN_IN} component={GoogleSignInPage} />
            <Route
              exact path={ROUTES.PASSWORD_FORGET}
              component={PasswordForgetPage}
            />
            <Route exact path={ROUTES.HOME} component={HomePage} />
            <Route exact path={ROUTES.PLAYS} component={PlaysPage} />
            <Route exact path={ROUTES.PLAY} component={PlayPage} />
            <Route exact path={ROUTES.ADD_CONFLICT} component={AddConflictPage} />
            <Route exact path={ROUTES.ADD_PLAY} component={AddPlayPage} />
            <Route exact path={ROUTES.EDIT_PLAY} component={EditPlayPage} />
            </Switch>
          </Col>
        </Row>
      </Container>
    </div>
  </Router>
);

export default withAuthentication(App);
