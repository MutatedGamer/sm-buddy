import React, { Component } from 'react';
import { Form, Button} from 'react-bootstrap';


class PlayDescription extends Component {
  saveAndContinue = (e) => {
    e.preventDefault();
    this.props.nextStep();
  }

  back = (e) => {
    e.preventDefault();
    this.props.prevStep();
  }

  render() {
    const { values } = this.props;
    const isInvalid = 
        values.name === '';
    return (
     <Form
      >
        <Form.Group controlId="playDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control name="description" onChange={this.props.onChange} as="textarea" rows="3" defaultValue={values.description}></Form.Control>
        </Form.Group>
        <Button onClick={this.back} disabled={isInvalid} variant="light" type="submit">
            Back
        </Button>
        <Button onClick={this.saveAndContinue} disabled={isInvalid} variant="light" type="submit">
            Next
        </Button>
    </Form>
    );
  }
}

export default PlayDescription;