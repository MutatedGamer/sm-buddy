import React, { Component } from 'react';
import { Form, Button, Col } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import { Header } from 'semantic-ui-react';


class PlayName extends Component {
  constructor(props) {
    super(props);

    this.state = {
        calendars: new Map(),
    };
    this.getCalendars = this.getCalendars.bind(this);
    this.makeNewCalendar = this.makeNewCalendar.bind(this);
    this.getCalendars();
  }

  saveAndContinue = (e) => {
    e.preventDefault();
    this.props.nextStep();
  }

  getCalendars() {
    console.log("getting calendars....");
    this.props.firebase.gapi.client.load('calendar', 'v3').then(() => {
      console.log("calendar loaded");
      this.props.firebase.gapi.client.calendar.calendarList.list({
      }).then(events => {
        let calendars = new Map();
        events.result.items.forEach(element => {
          if (element.accessRole === "writer" || element.accessRole === "owner") {
            calendars.set(element.summary, element.id);
          };
        });
        this.setState({
          calendars: calendars,
        });
      });
    });
  }

  makeNewCalendar() {
    console.log("making new calendar....");
    this.props.firebase.gapi.client.load('calendar', 'v3').then(() => {
      console.log("calendar loaded");
      this.props.firebase.gapi.client.calendar.calendars.insert({
        summary: "SM Buddy - New Calendar Created on " + new Date().toDateString(),
      }).then(response => {
        this.props.firebase.gapi.client.calendar.calendarList.insert({
          id: response.result.id
        }).then(response => {
          this.props.setCalendarId(response.result.id);
          this.getCalendars();
        });
      });
    });
  }

  render() {
    const { values } = this.props;
    const isInvalid =
        values.name === '' || values.email === "" || values.calendar === "";
    return (
      <div>
        <Header as="h2">{values.error}</Header>
        <Header as="h1">The Basics</Header>
         <Form>
           <Form.Row>
             <Col>
                <Form.Group controlId="playName">
                    <Form.Label>Play Name</Form.Label>
                    <Form.Control isInvalid={values.name === ""} name="name" onChange={this.props.onChange} type="text" defaultValue={values.name}></Form.Control>
                </Form.Group>
                <Form.Group controlId="playDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={5} name="description" onChange={this.props.onChange} type="textarea" defaultValue={values.description}></Form.Control>
                </Form.Group>
                <Form.Group controlId="smEmail">
                    <Form.Label>SM Mailing List (for SM, Producer, etc)</Form.Label>
                    <Form.Control isInvalid={values.email === ""} name="email" onChange={this.props.onChange} type="email" defaultValue={values.email}></Form.Control>
                </Form.Group>
                <label htmlFor="calendar">Play Google Calendar (loaded from your current calendars)</label>
                <InputGroup className="mb-3">
                    <Form.Control
                      as="select"
                      isInvalid={values.calendar === ""}
                      name="calendar"
                      onChange={this.props.onChange}
                      value={values.calendar}>
                      <option disabled value="">--</option>
                      { Array.from(this.state.calendars.keys()).map((val, index) => {
                        return (
                          <option key={index} value={this.state.calendars.get(val)}>{ val }</option>
                        );
                      })}
                    </Form.Control>
                    <InputGroup.Append>
                      <Button onClick={this.makeNewCalendar} variant="outline-primary">Or, make a new one!</Button>
                    </InputGroup.Append>
                </InputGroup>
              </Col>
            </Form.Row>
            <Form.Row>
              <Col>
              </Col>
              <Col className="text-right">
                <Form.Group>
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
