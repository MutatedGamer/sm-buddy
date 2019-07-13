import React, { Component } from 'react';
import { Card, Form } from 'react-bootstrap';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import './index.css';

class Scenes extends Component {
  constructor(props) {
    super(props)

    this.state = {activeDiv: ''};
  }

  getStyle = (style, snapshot) => {
    if (!snapshot.isDropAnimating || !(snapshot.draggingOver === "calendar")){
      return {
        ...style,
      };
    }
    return {
      ...style,
      // cannot be 0, but make it super tiny
      transitionDuration: `0.001s`,
    };
  }



  render() {
    return (
      <div>
        <div onClick={() => this.props.selectAllScenes()}>
          <Card className={this.props.showAll? "m-2 scene selected" : "m-2 scene"}>
            <Card.Body>
              <Card.Title>All Scenes</Card.Title>
            </Card.Body>
          </Card>
        </div>
        <Droppable droppableId="scenes">
          {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="d-flex flex-wrap flex-column justify-content-start">
              {
                this.props.values.play.scenes.map((scene, i) => {
                  const applyStagedTabled = scene.stagedTabled && !scene.tabled;
                  const applyStagedBlocked = scene.stagedBlocked && !scene.blocked;

                  return (
                    <Draggable key={scene.title} draggableId={scene.title} index={i}>
                    {(provided, snapshot) => (


                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => this.props.selectScene(i)}
                      style={this.getStyle(provided.draggableProps.style, snapshot)}
                    >
                      <Card className={scene.selected? "m-2 scene selected" : "m-2 scene"}>
                        <Card.Body>
                          <Card.Title>{scene.title}</Card.Title>
                            <Form.Check
                              type="checkbox"
                              className={applyStagedTabled && "staged"}
                              label={"Tabled (" + scene.table + ' mins needed)'}
                              checked= {scene.tabled || scene.stagedTabled}
                              custom={true}
                              readOnly={true}/>
                            <Form.Check
                              type="checkbox"
                              className={applyStagedBlocked && "staged"}
                              label={"Blocked (" + scene.blocking + ' mins needed)'}
                              checked={scene.blocked || scene.stagedBlocked}
                              custom={true}
                              readOnly={true}  />
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
      </div>
    );
  }
}

export default Scenes;
