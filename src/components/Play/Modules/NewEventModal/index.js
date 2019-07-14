import React, { Component } from 'react';
import { Button, Modal, Form, Col, ListGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { timeIntegerToString } from '../../../../Helpers/helpers.js';
import TimePicker from '../../../TimePicker';
var moment = require('moment');

function makeBody(scene) {
  let body = "Scene " + scene.title + "\n";
  body +=  "Called: ";
  body += scene.characters.map(character => scene.callLetters.get(character)).join(", ")
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
          duration: (tabled?this.props.scene.blocking : this.props.scene.table)*60,
          currentConflicts: new Map(),
          type: tabled?"block":"table",
          id: this.props.scene.id,
      };

      this.appendConflicts = this.appendConflicts.bind(this);
  }

  appendConflicts = () => {
    let currentConflicts = this.state.currentConflicts
    let toAppend = "\nConflicts:\n";
    currentConflicts.forEach((conflicts, actor) => {
      toAppend += "  "  + actor + ": " + conflicts.join(", ") + "\n"
      })
    this.setState({body: this.state.body + toAppend})
  }

  componentDidMount() {
    this.updateConflicts()
  }

  updateConflicts = () => {
    let date = this.state.date
    let start = parseInt(this.state.start)
    let end = start + this.state.duration
    const newConflicts = new Map();
    this.props.scene.actorConflicts.forEach((conflicts, actor) => {
      let newActorConflicts = getConflicts(date, start, end, conflicts)
      if (newActorConflicts.length > 0) {
        newConflicts.set(actor, newActorConflicts)
      }
    });
    console.log(newConflicts)
    this.setState({currentConflicts:  newConflicts});
  }

  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value }, this.updateConflicts)
  }

  updateDate = (date) => {
    this.setState({date: date}, this.updateConflicts);
  }

  updateType = (e) => {
    const type = e.target.value;
    let title;
    let duration;
    if (type == "block") {
      title = "Rehearsal: Block " + this.props.scene.title;
      duration = this.props.scene.blocking*60
    } else {
      title = "Rehearsal: Table " + this.props.scene.title;
      duration = this.props.scene.table*60
    }
    this.setState(
      {type: e.target.value,
        title: title,
        duration: duration
      }, this.updateConflicts)
  }

  render() {
    let scene = this.props.scene;
    let {body, title, date, start, duration, type, id} = this.state;
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{'Schedule Scene ' + scene.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>Type</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={this.updateType}
                    value={type}>
                    <option value="table">{"Table (" + scene.table + " mins)"}</option>
                    <option value="block">{"Block (" + scene.blocking + " mins)"}</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    as={DatePicker}
                    selected={date}
                    name="date"
                    onChange={this.updateDate}
                  />
                </Form.Group>
                <Form.Group as={Col} key={"start-" + start}>
                  <Form.Label>Start Time</Form.Label>
                  <TimePicker
                    start="6:00"
                    end="24:00"
                    step={5}
                    name="start"
                    defaultValue={this.state.start}
                    onChange={this.onChange}
                  />
                </Form.Group>
              </Form.Row>
              {this.state.currentConflicts.size > 0 &&
              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>Conflicts</Form.Label>
                  <ListGroup>
                    {
                      Array.from(this.state.currentConflicts.keys()).map(actor => {
                        let conflicts = this.state.currentConflicts.get(actor)
                        console.log(conflicts)
                        return (
                          <ListGroup.Item key={actor} variant="danger">
                            {actor + ": " + conflicts.join(", ")}
                          </ListGroup.Item>
                        )
                      })
                    }
                    <ListGroup.Item >
                      <Button variant="primary" onClick={this.appendConflicts}>Add to event description</Button>
                    </ListGroup.Item>
                  </ListGroup>
                </Form.Group>
              </Form.Row>
              }
              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>Event Title</Form.Label>
                  <Form.Control
                    as="input"
                    name="title"
                    rows="10"
                    value={title}
                    onChange={this.onChange} />
                  </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>Event Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="body"
                    rows="10"
                    value={body}
                    onChange={this.onChange} />
                  </Form.Group>
              </Form.Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.props.handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={() => this.props.handleSubmit({date, start, duration, title, body, type, id})}>
              Add to Calendar
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

/**
 * Returns an array of strings representing the times the actor
 * is unavailable between [startTime, endTime)
 * For example, ["9:00 AM - 9:15 AM", "9:30 AM - 9:45 AM"]
 */
function getConflicts(date, startTime, endTime, actorConflicts) {
  const conflicts = []
  actorConflicts.forEach(conflict => {
    if (dateConflicts(date, conflict)) {
      let startConflict = Math.max(conflict.start, startTime)
      let endConflict = Math.min(conflict.end, endTime)
      if (startConflict < endConflict) {
        conflicts.push(
          timeIntegerToString(startConflict) + " - " + timeIntegerToString(endConflict)
        )
      }
    }
  });
  return conflicts;
}

function dateConflicts(date, conflict) {
  if (conflict.type === "regular") {
    if (moment(date).format('LL') === moment(conflict.date).format('LL')) {
      return true
    }
  } else if (conflict.type === "recurring") {
    if (moment(date).format('dddd').toLowerCase() === conflict.date.toLowerCase()) {
      return true
    }
  }
  return false
}

export default NewEventModal
