import React, { Component } from 'react';
import { Card, Form } from 'react-bootstrap';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import './index.css';

class Scenes extends Component {
  constructor(props) {
    super(props)

    this.state = {activeDiv: ''};
  }



  render() {
    return (
        <Droppable droppableId="scenes">
        {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className="d-flex flex-wrap flex-column justify-content-start">
            {
              this.props.values.play.scenes.map((scene, i) => {
                return (
                  <Draggable key={scene.title} draggableId={scene.title} index={i}>
                  {(provided, snapshot) => (


                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => this.props.selectScene(i)}>
                    <Card className={scene.selected? "m-2 scene selected" : "m-2 scene"}>
                      <Card.Body>
                        <Card.Title>{scene.title}</Card.Title>
                          <Form.Check type="checkbox" label={"Tabled"  + ' (' + scene.table + ' mins needed)'} checked={scene.tabled } custom={true} readOnly={true}/>
                          <Form.Check type="checkbox" label={"Blocked" + ' (' + scene.blocking + ' mins needed)'} checked={scene.blocked} custom={true} readOnly={true}  />
                      </Card.Body>
                    </Card>
                  </div>

                  )}
                  </Draggable>
                );
              })
            }
            {provided.placeholder}
        </div>
        )}
        </Droppable>
    );
  }
}

export default Scenes;