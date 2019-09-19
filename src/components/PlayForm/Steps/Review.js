import React, { Component } from 'react';
import { Button, Col, Row, Container, Form } from 'react-bootstrap';
import { Header, List } from 'semantic-ui-react';
import { timeIntegerToString } from '../../../Helpers/helpers.js';


class Review extends Component {
  saveAndContinue = (e) => {
    e.preventDefault();
    this.props.nextStep();
  }

  back = (e) => {
    e.preventDefault();
    this.props.prevStep();
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.props.onSubmit();
  }

  render() {
    const { values } = this.props;
    let scenes = values.scenes;
    let actors = values.actors;
    let name = values.name;
    let description = values.description;

    return (
      <div>
        <Header as="h2">{values.error}</Header>
        <Header as="h1">Review and Submit</Header>
        <Header as="h3">Name: </Header><p>{name}</p>
        <Header as="h3">Description: </Header><p>{description}</p>
        <Header as="h3">Actors: </Header>
        <List>
          { actors.map((val, indx) => {
            return (
              <List.Item key={indx}>
                <List.List>
                  <List.Item>
                    <List.Icon name='user' />
                    <List.Content>
                      <List.Header>Name</List.Header>
                        <List.Description>{val.name}</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name='sticky note' />
                    <List.Content>
                      <List.Header>Notes</List.Header>
                      <List.Description>{val.notes}</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name='users' />
                    <List.Content>
                      <List.Header>Characters</List.Header>
                      <List.List>
                        { actors[indx]["characters"].map((val, indx) => {
                          return (
                            <List.Item key={indx}>
                              <List.Content>
                                <List.Description>{val}</List.Description>
                              </List.Content>
                            </List.Item>
                            );
                          })
                        }
                      </List.List>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name='calendar' />
                    <List.Content>
                      <List.Header>Unavailibilities</List.Header>
                      <List.List>
                        { actors[indx]["unavailibilities"].map((val, indx) => {
                          return (
                            <List.Item key={indx}>
                              <List.Content>
                                <List.Description>{val.day} {timeIntegerToString(val.start)} - {timeIntegerToString(val.end)}</List.Description>
                              </List.Content>
                            </List.Item>
                            );
                          })
                        }
                      </List.List>
                    </List.Content>
                  </List.Item>
                </List.List>
              </List.Item>
              );
            })
          }
        </List>
        <Header as="h3">Scenes: </Header>
        <List>
          { scenes.map((val, indx) => {
            return (
              <List.Item key={indx}>
                <List.List>
                  <List.Item>
                    <List.Icon name='book' />
                    <List.Content>
                      <List.Header>Title</List.Header>
                        <List.Description>{val.title}</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name='sticky note' />
                    <List.Content>
                      <List.Header>Notes</List.Header>
                      <List.Description>{val.notes}</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name='users' />
                    <List.Content>
                      <List.Header>Characters</List.Header>
                      <List.List>
                        { scenes[indx]["characters"].map((val, indx) => {
                          return (
                            <List.Item key={indx}>
                              <List.Content>
                                <List.Description>{val}</List.Description>
                              </List.Content>
                            </List.Item>
                            );
                          })
                        }
                      </List.List>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name='clock' />
                    <List.Content>
                      <List.Header>Table Time</List.Header>
                      <List.Description>{val.table}</List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name='clock' />
                    <List.Content>
                      <List.Header>Blocking Time</List.Header>
                      <List.Description>{val.blocking}</List.Description>
                    </List.Content>
                  </List.Item>
                </List.List>
              </List.Item>
              );
            })
          }
        </List>
        <hr />
        <Container>
          <Row>
            <Col></Col>
            <Col className="text-right">
              <Form>
                <Form.Group>
                  <Button onClick={this.back}  variant="light" type="submit">
                    Back
                  </Button>
                  <Button onClick={this.onSubmit} variant="success" type="submit">
                      Submit
                  </Button>
                </Form.Group>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Review;
