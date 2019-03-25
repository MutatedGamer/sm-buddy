import React, { Component } from 'react';
import { Form, Button, Col } from 'react-bootstrap';
import { Header } from 'semantic-ui-react';


class PlayDescription extends Component {
  saveAndContinue = (e) => {
    e.preventDefault();
    this.props.nextStep();
  }

  render() {
    const { values } = this.props;
    const isInvalid =
        values.name === '';
    return (
      <div>
        <Header as="h1">The Basics</Header>
         <Form>
           <Form.Row>
             <Col>
                <Form.Group controlId="playName">
                    <Form.Label>Description</Form.Label>
                    <Form.Control name="name" onChange={this.props.onChange} type="text" defaultValue={values.description}></Form.Control>
                </Form.Group>
              </Col>
            </Form.Row>
            <Form.Row>
              <Col>
              </Col>
              <Col className="text-right">
                <Form.Group>
                  <Button onClick={this.back} variant="light" type="submit">
                    Back
                  </Button>
                  <Button onClick={this.saveAndContinue} disabled={isInvalid} variant="light" type="submit">
                      Next
                  </Button>
                </Form.Group>
              </Col>
            </Form.Row>
        </Form>

      </div>
    );
  }
}

export default PlayDescription;
