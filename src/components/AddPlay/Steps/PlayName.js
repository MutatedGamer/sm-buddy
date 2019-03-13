import React, { Component } from 'react';
import { Form, Button} from 'react-bootstrap';


class PlayName extends Component {
  saveAndContinue = (e) => {
    e.preventDefault();
    this.props.nextStep();
  }

  render() {
    const { values } = this.props;
    const isInvalid = 
        values.name === '';
    return (
     <Form
      >
        <Form.Group controlId="playName">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" onChange={this.props.onChange} type="text" defaultValue={values.name}></Form.Control>
        </Form.Group>
        <Button onClick={this.saveAndContinue} disabled={isInvalid} variant="light" type="submit">
            Next
        </Button>
    </Form>
    );
  }
}

export default PlayName;