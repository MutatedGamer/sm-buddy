import React from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';

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
  <Router>
    <div>
      <Navigation />
      <Container fluid={true} className="p-2">
        <Row>
          <Col>
            <Route exact path={ROUTES.LANDING} component={LandingPage} />
            <Route path={ROUTES.SIGN_IN} component={SignInPage} />
            <Route path={ROUTES.GOOGLE_SIGN_IN} component={GoogleSignInPage} />
            <Route
              path={ROUTES.PASSWORD_FORGET}
              component={PasswordForgetPage}
            />
            <Route path={ROUTES.HOME} component={HomePage} />
            <Route path={ROUTES.PLAYS} component={PlaysPage} />
            <Route path={ROUTES.PLAY} component={PlayPage} />
            <Route path={ROUTES.ADD_CONFLICT} component={AddConflictPage} />
            <Route path={ROUTES.ADD_PLAY} component={AddPlayPage} />
            <Route path={ROUTES.EDIT_PLAY} component={EditPlayPage} />
          </Col>
        </Row>
      </Container>
    </div>
  </Router>
);

export default withAuthentication(App);
