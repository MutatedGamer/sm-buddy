import React, { Component } from 'react';
import { Button, Modal, Form, Col } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import TimePicker from '../../../TimePicker';

function makeBody(scene) {
  let body = "Scene " + scene.title + "\n";
  body +=  "Called: \n";
  scene.characters.forEach(character => {
    body += "  " + character + "\n"
    });
  body += "\n";
  body += "SM: TODO";
  return body;
};

class NewEventModal extends Component {
  constructor(props) {
      super(props);
      this.myRef = React.createRef();
      let tabled = this.props.scene.tabled;

      this.state = {
          body: makeBody(this.props.scene),
          title: "Rehearsal: " + (tabled?"Block":"Table") + " " + this.props.scene.title,
          date: new Date(),
          start: "32400",
          duration: (tabled?this.props.scene.blocking : this.props.scene.table)*60
      };
    }

  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value })
  }

  updateDate = (date) => {
    this.setState({date: date});
  }

  render() {
    let scene = this.props.scene;
    console.log(this.state);
    let {body, title, date, start, duration} = this.state;
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{'Schedule Scene ' + scene.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Row>
                <Col>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    as={DatePicker}
                    selected={date}
                    name="date"
                    onChange={this.updateDate}
                  />
                </Col>
                <Col key={"start-" + start}>
                  <Form.Label>Start Time</Form.Label>
                  <TimePicker
                    start="6:00"
                    end="24:00"
                    step={5}
                    name="start"
                    defaultValue={this.state.start}
                    onChange={this.onChange}
                  />
                </Col>
              </Form.Row>
              <Form.Row>
                <Col>
                  <Form.Label>Event Title</Form.Label>
                  <Form.Control
                    as="input"
                    name="title"
                    rows="10"
                    value={title}
                    onChange={this.onChange} />
                  </Col>
              </Form.Row>
              <Form.Row>
                <Col>
                  <Form.Label>Event Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="body"
                    rows="10"
                    value={body}
                    onChange={this.onChange} />
                  </Col>
              </Form.Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.props.handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={() => this.props.handleSubmit({date, start, duration, title, body})}>
              Add to Calendar
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default NewEventModal
