import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import { timeIntegerToString } from '../../../../Helpers/helpers.js';
var moment = require('moment');

class SceneInfo extends Component {
  renderConflicts(scene) {
    let actors = [];

    for (let actor of scene.actorConflicts.keys()) {
      let conflicts = [];
      scene.actorConflicts.get(actor).forEach((conflict, i) => {
        if (conflict.type === "regular") {
          conflicts.push(<li key={"conflict-" + i}>{moment(conflict.date).format('MMM Do') + ' ' +
                          timeIntegerToString(parseInt(conflict.start)) + ' - '
                          + timeIntegerToString(parseInt(conflict.end))
                        }</li>);
        } else if (conflict.type === "recurring") {
          conflicts.push(<li key={"conflict-" + i}>{"(recurring) " + conflict.date + "s '" +
                          timeIntegerToString(parseInt(conflict.start)) + ' - '
                          + timeIntegerToString(parseInt(conflict.end))
                        }</li>);
        }
      });
      actors.push(<li key={actor}>{actor}<ul>{conflicts}</ul></li>)
    };
    return actors;
  }

  render() {
    var scenes = this.props.scenes;
    return (
      <Row>
        {
          scenes.map((scene, i) => {
            return (
              <Col md={6} key={"scene-" + i}>
                <h3>Title:</h3> {scene.title}
                <h3>Notes:</h3> {scene.notes}
                <h3>Characters:</h3>
                  <ul>
                    {
                      scene.characters.map((char, charIndx) => {
                        return <li key={"char" + charIndx}>{char}</li>
                      })
                    }
                  </ul>
                <h3>Conflicts:</h3>
                  <ul>
                    {
                      this.renderConflicts(scene)
                    }
                  </ul>
              </Col>
            );
          })
        }
      </Row>
    );
  }
}

export default SceneInfo
