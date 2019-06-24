import React, { Component } from 'react';
import { Button, Modal, Form, Col } from 'react-bootstrap';


class EditEventModal extends Component {
  constructor(props) {
      super(props);

      this.state = {
          description: this.props.event.description,
          title: this.props.event.title
      };
    }

  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value })
  }


  render() {
    let {description, title } = this.state;
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{'Edit Event'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
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
                    name="description"
                    rows="10"
                    value={description}
                    onChange={this.onChange} />
                  </Col>
              </Form.Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.props.handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={() => this.props.handleSubmit({title, description})}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default EditEventModal
