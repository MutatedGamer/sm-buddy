import React, { Component } from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import TimePicker from '../../TimePicker';
import { Header } from 'semantic-ui-react';


class PlayActor extends Component {
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
    let isInvalid = false;
    let actors = values.actors;
    return (
      <div>
        <Header as="h2">{values.error}</Header>
        <Header as="h1">Actors</Header>
        <Form onChange={this.props.onChange}>

            { actors.map((val, indx) => {
              isInvalid = isInvalid || val.name === "" || val.email === "";
              return (
                <div key={indx}>
                  <Form.Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          isInvalid={val.name === ""}
                          type="text"
                          data-collection="actors"
                          data-attr="name"
                          data-elementid={indx}
                          value={val.name}
                          onChange = {() => {}}
                          />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          isInvalid={val.email === ""}
                          type="email"
                          data-collection="actors"
                          data-attr="email"
                          data-elementid={indx}
                          value={val.email}
                          onChange = {() => {}}
                          />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Characters</Form.Label>
                          { actors[indx]["characters"].map((val, charIndx) => {
                            isInvalid = isInvalid || val === "";
                              return (
                                <div key={charIndx}>
                                  <InputGroup className="mb-3">
                                    <InputGroup.Prepend>
                                      <Button variant="danger" onClick={this.props.removeCharacter.bind(this, "actors", indx, charIndx)}>-</Button>
                                    </InputGroup.Prepend>
                                    <Form.Control
                                      isInvalid={val === ""}
                                      type="text"
                                      data-collection="actors"
                                      data-elementid={indx}
                                      data-charrid={charIndx}
                                      aria-describedby="basic-addon2"
                                      value={val}
                                      onChange={this.props.updateCharacter}
                                    />
                                  </InputGroup>
                                </div>
                              );
                            })
                          }
                      </Form.Group>
                      <Form.Group>
                        <Button variant="success" onClick={this.props.addCharacter.bind(this, "actors", indx)}>Add Character</Button>
                      </Form.Group>
                      <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Label>Unavailibilities</Form.Label>
                        { actors[indx]["unavailibilities"].map((data, dataIndx) => {
                          let day = data["day"];
                          let start = data["start"];
                          let end = data["end"];

                          isInvalid = isInvalid || end <= start;
                          return (
                            <Form.Row key={dataIndx}>
                              <Form.Group as={Col} xs={1}>
                                <Button variant="danger" onClick={this.props.removeUnavailbility.bind(this, indx, dataIndx)}>-</Button>
                              </Form.Group>
                              <Form.Group as={Col}>
                                <Form.Control
                                  as="select"
                                  data-collection="actors"
                                  data-elementid={indx}
                                  data-timeid={dataIndx}
                                  data-timeattr="day"
                                  value={day}
                                  onChange={this.props.updateUnavailibility}
                                  >
                                  <option value="Sunday">Sunday</option>
                                  <option value="Monday">Monday</option>
                                  <option value="Tuesday">Tuesday</option>
                                  <option value="Wednesday">Wednesday</option>
                                  <option value="Thursday">Thursday</option>
                                  <option value="Friday">Friday</option>
                                  <option value="Saturday">Saturday</option>
                                </Form.Control>
                              </Form.Group>
                              <Form.Group as={Col}>
                                  <TimePicker
                                    start="9:00"
                                    end="22:00"
                                    step={15}
                                    data-collection="actors"
                                    data-elementid={indx}
                                    data-timeid={dataIndx}
                                    data-timeattr="start"
                                    defaultValue={String(start)}
                                    onChange={this.props.updateUnavailibility}
                                   />
                              </Form.Group>
                              <Form.Group as={Col}>
                                <TimePicker
                                    start="9:00"
                                    end="22:00"
                                    step={15}
                                    isInvalid={end <= start}
                                    data-collection="actors"
                                    data-elementid={indx}
                                    data-timeid={dataIndx}
                                    data-timeattr="end"
                                    defaultValue={String(end)}
                                    onChange={this.props.updateUnavailibility}
                                   />
                              </Form.Group>
                            </Form.Row>
                          );
                        })
                      }
                      <Form.Row>
                        <Form.Group as={Col}>
                          <Button variant="success" onClick={this.props.addUnavailibility.bind(this, indx)}>Add</Button>
                        </Form.Group>
                      </Form.Row>
                      <Form.Group>
                        <Button variant="danger" disabled={actors.length === 1} onClick={this.props.deleteItem.bind(this, "actors", indx)}>Delete Actor</Button>
                      </Form.Group>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label>Notes</Form.Label>
                        <Form.Control
                          as="textarea"
                          data-collection="actors"
                          data-attr="notes"
                          data-elementid={indx}
                          value = {val.notes}
                          onChange = {() => {}}
                          rows={12}
                        />
                      </Form.Group>
                    </Col>
                  </Form.Row>
                  <hr />
                </div>
              )
              })
            }
            <Form.Row>
              <Col>
                <Form.Group>
                  <Button type="text" onClick={this.props.addActor}>Add New Actor</Button>
                </Form.Group>
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

export default PlayActor;
