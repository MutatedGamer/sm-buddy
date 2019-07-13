import React, { Component } from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
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
    let scenes = values.scenes;

    let characters = new Set();
    values.actors.forEach((actor) => {
      actor.characters.forEach((character) => {
        characters.add(character);
      })
    });
    characters = Array.from(characters).sort();
    return (
      <div>
        <Header as="h2">{values.error}</Header>
        <Header as="h1">Scenes</Header>
        <Form onChange={this.props.onChange}>
            { scenes.map((val, indx) => {
              isInvalid = isInvalid || val.title === "";
              return (
                <div key={indx}>
                  <Form.Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Control isInvalid={val.title === ""} type="text" data-collection="scenes" data-attr="title" data-elementid={indx} placeholder="E.g. 1.1a"/>
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Characters</Form.Label>
                          { scenes[indx]["characters"].map((val, charIndx) => {
                              isInvalid = isInvalid || val === "";
                              return (
                                <div key={charIndx}>
                                  <InputGroup className="mb-3">
                                    <InputGroup.Prepend>
                                      <Button variant="danger" onClick={this.props.removeCharacter.bind(this, "scenes", indx, charIndx)}>-</Button>
                                    </InputGroup.Prepend>
                                    <Form.Control
                                      as="select"
                                      data-collection="scenes"
                                      data-elementid={indx}
                                      data-charrid={charIndx}
                                      value={val}
                                      isInvalid={val === ""}
                                      onChange={this.props.updateCharacter}
                                      >
                                        <option disabled value="">--</option>
                                      { characters.map((val, index) => {
                                        return (
                                          <option key={index} value={val}>{ val }</option>
                                        );
                                      })}
                                    </Form.Control>
                                  </InputGroup>
                                </div>
                              );
                            })
                          }
                      </Form.Group>
                      <Form.Group>
                        <Button variant="success" onClick={this.props.addCharacter.bind(this, "scenes", indx)}>Add Character</Button>
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Time for Tablework (minutes)</Form.Label>
                        <Form.Control
                          type="number"
                          min={0}
                          data-collection="scenes"
                          data-attr="table"
                          data-elementid={indx}
                          value={val.table}
                          onChange = {() => {}}
                          />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Time for Blocking (minutes)</Form.Label>
                        <Form.Control
                          type="number"
                          min={0}
                          data-collection="scenes"
                          data-attr="block"
                          data-elementid={indx}
                          value={val.block}
                          onChange = {() => {}}
                          />
                      </Form.Group>
                      <Form.Group>
                        <Button variant="danger" disabled={scenes.length === 1} onClick={this.props.deleteItem.bind(this, "scenes", indx)}>Delete Scene</Button>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label>Notes</Form.Label>
                        <Form.Control
                            as="textarea"
                            data-collection="scenes"
                            data-attr="notes"
                            data-elementid={indx}
                            value={val.notes}
                            onChange = {() => {}}
                            rows={16}
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
                <Button type="text" onClick={this.props.addScene}>Add New Scene</Button>
              </Form.Group>
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

export default PlayActor;
