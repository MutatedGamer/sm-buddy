import React, { Component } from 'react';
import { Button, Col, Row, Container, Form } from 'react-bootstrap';
import { Header, Input, TextArea, List } from 'semantic-ui-react';


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

  handleChange = (e) => {
    if (["name", "notes", "character"].some(r => e.target.className.includes(r)) ) {
      console.log('here');
      let actors = [...this.state.actors];
      if (e.target.className.includes("name")) {
        actors[e.target.dataset.id]["name"] = e.target.value;
      } else if (e.target.className.includes("notes")) {
        actors[e.target.dataset.id]["notes"] = e.target.value;
      } else if (e.target.className.includes("character")) {
        actors[e.target.dataset.id]["characters"][e.target.dataset.charid] = e.target.value;
      }
      this.setState({ actors }, () => console.log(this.state.actors))
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
    <Row>
      <Col>
        <Form onChange={this.handleChange}>
          <Header as="h1">Actor</Header>

            { actors.map((val, indx) => {
              return (
                <Container key={indx}>
                  <Row>
                    <Col>
                        <Form.Group>
                          <Form.Label>Name</Form.Label>
                          <Form.Control type="text" className="name" data-id={indx} />
                        </Form.Group>
                    </Col>
                  </Row>
                    <Row>
                    <Col xs={{ span: 11, offset: 1}}>
                        <Form.Group>
                          <Form.Label>Characters</Form.Label>
                            { actors[indx]["characters"].map((val, charIndx) => {
                                return (
                                  <Form.Control className="character" key={charIndx} type="text" data-id={indx} data-charid={charIndx} id={charIndx}/>
                                )
                              })
                            }
                        </Form.Group>
                        <Button variant="primary" onClick={this.addCharacter.bind(this, indx)}>Add Character</Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={{ span: 11, offset: 1}}>
                        <Form.Group>
                          <Form.Label>Unavailibility</Form.Label>
                          <Input />
                        </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={{ span: 11, offset: 1}}>
                        <Form.Group>
                          <Form.Label>Notes</Form.Label>
                          <Form.Control as="textarea" className="notes" data-id={indx} />
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
      </Col>
    </Row>
    );
  }
}

export default PlayActor;
