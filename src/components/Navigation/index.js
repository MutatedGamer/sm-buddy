import React from 'react';
import { Navbar, Nav } from "react-bootstrap";
import { AuthUserContext } from '../Session';
import * as ROUTES from '../../constants/routes';
import SignOutButton from '../SignOut';
import { LinkContainer } from "react-router-bootstrap";

const Navigation = () => (
  <div>
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? <NavigationAuth /> : <NavigationNonAuth />
      }
    </AuthUserContext.Consumer>
  </div>
);

const NavigationAuth = () => (
  <Navbar collapseOnSelect expand="md" bg="dark" variant="dark">
    <Navbar.Brand href={ROUTES.LANDING}>
      <img
        alt=""
        src="/theater.svg"
        width="30"
        height="30"
        className="d-inline-block aling-top mr-3"
      />
      { 'SM Buddy'}
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
    <Navbar.Collapse id="responsive-navbar-nav">
      <Nav className="mr-auto">
        <Nav.Item>
          <LinkContainer to={ROUTES.HOME}>
            <Nav.Link>Home</Nav.Link>
          </LinkContainer>
        </Nav.Item>
        <Nav.Item>
          <LinkContainer to={ROUTES.ACCOUNT}>
            <Nav.Link>Account</Nav.Link>
          </LinkContainer>
        </Nav.Item>
        <Nav.Item>
          <LinkContainer to={ROUTES.PLAYS}>
            <Nav.Link>My Plays</Nav.Link>
          </LinkContainer>
        </Nav.Item>
      </Nav>
      <Nav>
        <Nav.Item>
          <SignOutButton />
        </Nav.Item>
      </Nav>
    </Navbar.Collapse>
</Navbar>
);

const NavigationNonAuth = () => (
  <Navbar collapseOnSelect expand="md" bg="dark" variant="dark">
    <Navbar.Brand href={ROUTES.LANDING}>
      <img
        alt=""
        src="/theater.svg"
        width="30"
        height="30"
        className="d-inline-block aling-top mr-3"
      />
      {'SM Buddy'}
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
    <Navbar.Collapse id="responsive-navbar-nav">
      <Nav className="mr-auto">
      </Nav>
      <Nav>
        <Nav.Item>
          <LinkContainer to={ROUTES.SIGN_UP}>
            <Nav.Link>Signup</Nav.Link>
          </LinkContainer>
        </Nav.Item>
        <Nav.Item>
          <LinkContainer to={ROUTES.SIGN_IN}>
            <Nav.Link>Login</Nav.Link>
          </LinkContainer>
        </Nav.Item>
      </Nav>
    </Navbar.Collapse>
</Navbar>
);

export default Navigation;
