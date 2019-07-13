import React, { Component } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { Header } from 'semantic-ui-react';


class PlayName extends Component {
  constructor(props) {
    super(props);
  }

  back = (e) => {
    e.preventDefault();
    this.props.prevStep();
  }

  saveAndContinue = (e) => {
    e.preventDefault();
    this.props.nextStep();
  }

  render() {
    const { values } = this.props;
    let isInvalid = false;
    const characters = [];
    values.actors.forEach((actor) => {
      actor.characters.forEach((character) => {
        characters.push(character);
      })
    });

    return (
      <div>
        <Header as="h2">{values.error}</Header>
        <Header as="h1">Call Letters</Header>
         <Form>
         {
           characters.map((character, indx) => {
             const currentLetters = this.props.values.callLetters.get(character)
             isInvalid = isInvalid || !currentLetters
             return (
               <Form.Group as={Row} key={indx}>
                  <Form.Label column sm="2">
                    { character }
                  </Form.Label>
                  <Col sm="2">
                    <Form.Control
                      defaultValue={currentLetters}
                      isInvalid={!currentLetters}
                      onChange={ this.props.updateCallLetters.bind(this, character) }
                    />
                  </Col>
                </Form.Group>
               )
             })
         }
            <Form.Row>
              <Col>
              </Col>
              <Col className="text-right">
                <Form.Group>
                  <Button onClick={this.back}  variant="light" type="submit">
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

export default PlayName;
