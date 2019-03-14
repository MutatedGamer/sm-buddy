import React, { Component } from 'react';
import { Button, Col, Row, Container, Form } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import TimePicker from '../../TimePicker';
import { Header } from 'semantic-ui-react';


class PlayActor extends Component {
  state = {
    actors: [{name:"", characters:[""], notes:""},],
  }

  addActor = (e) => {
    e.preventDefault();
    this.setState((prevState) => ({
      actors: [...prevState.actors, {name:"", characters:[""], notes:""}],
    }));
  }

  addCharacter = (i, e) => {
    let actors = [...this.state.actors];
    console.log(actors[i]);
    actors[i]["characters"] = [...this.state.actors[i]["characters"], ""];
    console.log(actors[i]);
    this.setState((prevState) => ({
      actors
    }));
  }

  removeCharacter = (i, charIndx, e) => {
    let actors = [...this.state.actors];
    let characters = actors[i]["characters"];
    console.log(characters);
    if (characters.length == 1) {
      return;
    } else {
      let newCharacters = characters.slice(0, charIndx).concat(characters.slice(charIndx+1, characters.length));
      actors[i]["characters"] = newCharacters;
      this.setState((prevState) => ({
        actors
      }));
    }
  }

  handleChange = (e) => {
    console.log(e.target.value);
    let actors = [...this.state.actors];
    if (e.target.dataset.type == "outer") {
      actors[e.target.dataset.actorid][e.target.dataset.attr] = e.target.value;
      this.setState((prevState) => ({
        actors
      }));
    } else if (e.target.dataset.type == "inner") {
      console.log('here');
      actors[e.target.dataset.actorid][e.target.dataset.attr][e.target.dataset.attrid] = e.target.value;
      this.setState((prevState) => ({
        actors
      }));
    } else {
      this.setState({ [e.target.name]: e.target.value })
    }
  }

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
    let {actors} = this.state;
    return (
        <Form onChange={this.handleChange}>
          <Header as="h1">Actor</Header>

            { actors.map((val, indx) => {
              return (
                <Container key={indx}>
                  <Row>
                    <Col>
                        <Form.Group>
                          <Form.Label>Name</Form.Label>
                          <Form.Control type="text" data-type="outer" data-attr="name" data-actorid={indx} />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Characters</Form.Label>
                            { actors[indx]["characters"].map((val, charIndx) => {
                                const last = charIndx == actors[indx]["characters"].length - 1;
                                return (
                                  <div key={charIndx}>
                                    {last ? (
                                      <InputGroup className="mb-3">
                                        <InputGroup.Prepend>
                                          <Button variant="danger" onClick={this.removeCharacter.bind(this, indx, charIndx)}>-</Button>
                                        </InputGroup.Prepend>
                                        <Form.Control
                                          type="text"
                                          data-type="inner"
                                          data-attr="characters"
                                          data-actorid={indx}
                                          data-attrid={charIndx}
                                          aria-describedby="basic-addon2"
                                          value={val}
                                          onChange={()=>{}}
                                        />
                                        <InputGroup.Append>
                                          <Button variant="success" onClick={this.addCharacter.bind(this, indx)}>Add Character</Button>
                                        </InputGroup.Append>
                                      </InputGroup>
                                    ) : (
                                      <InputGroup className="mb-3">
                                        <InputGroup.Prepend>
                                          <Button variant="danger" onClick={this.removeCharacter.bind(this, indx, charIndx)}>-</Button>
                                        </InputGroup.Prepend>
                                        <Form.Control
                                          type="text"
                                          data-type="inner"
                                          data-attr="characters"
                                          data-actorid={indx}
                                          data-attrid={charIndx}
                                          aria-describedby="basic-addon2"
                                          value={val}
                                          onChange={()=>{}}
                                        />
                                      </InputGroup>
                                    )}
                                  </div>
                                );
                              })
                            }
                        </Form.Group>
                        <Form.Group controlId="exampleForm.ControlSelect1">
                          <Form.Label>Unavailibilities</Form.Label>
                            <Form.Row>
                              <Form.Group as={Col}>
                                <Form.Control as="select">
                                  <option value="sunday">Sunday</option>
                                  <option value="monday">Monday</option>
                                  <option value="tuesday">Tuesday</option>
                                  <option value="wednesday">Wednesday</option>
                                  <option value="thursday">Thursday</option>
                                  <option value="friday">Friday</option>
                                  <option value="saturday">Saturday</option>
                                </Form.Control>
                              </Form.Group>
                              <Form.Group as={Col}>
                                  <TimePicker   start="9:00" end="22:00" step={15} />
                              </Form.Group>
                              <Form.Group as={Col}>
                                  <TimePicker   start="9:00" end="22:00" step={15} />
                              </Form.Group>
                            </Form.Row>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                          <Form.Label>Notes</Form.Label>
                          <Form.Control as="textarea" data-type="outer" data-attr="notes" data-actorid={indx} rows={8}/>
                        </Form.Group>
                    </Col>
                  </Row>
                  <hr />
                </Container>
              )
              })
            }

            <Form.Group>
              <Button type="text" onClick={this.addActor}>Add New Actor</Button>
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

export default PlayActor;
