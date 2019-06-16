import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Col, Row, Container, Form } from 'react-bootstrap';

class InfoPage extends Component {
  render() {
    return (
      <div>
      { <Link to={ '/addconflict/' + this.props.values.playId }>Actor conflict submission page (send to actors!) </Link> }
      </div>
    );
  }
}

export default InfoPage;