import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus} from '@fortawesome/free-solid-svg-icons'
import { ButtonGroup, Button, Col, Row, Container } from 'react-bootstrap';
import ActorHeatMap from '../Modules/ActorHeatMap/ActorHeatMap';
import Scenes from '../Modules/Scenes/Scenes';
import SceneInfo from '../Modules/SceneInfo/SceneInfo';
import Calendar from '../Modules/Calendar/Calendar';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

// Conflict Class
function Conflict(date, start, end, type="regular") {
  if (type == "regular") {
    this.type = "regular";
    this.date = date.toDate();
  } else if (type == "recurring") {
    this.type = "recurring";
    this.date = date;
  }
  this.start = start;
  this.end = end;
}


// Scene Class
function Scene(title, table, blocking, notes, tabled, blocked) {
  this.characters = [];
  this.actorConflicts = new Map();
  this.title = title;
  this.blocking = blocking;
  this.table = table;
  this.notes = notes;
  this.blocked = blocked;
  this.tabled = tabled;
  this.selected = false;
}

Scene.prototype.addCharacter = function(character) {
  this.characters.push(character);
}

Scene.prototype.addActor = function(actor) {
  if (!this.actorConflicts.has(actor)) {
    this.actorConflicts.set(actor, new Array());
  }
}

Scene.prototype.addConflict = function(actor, conflict) {
  // assumes actor is already added to scene
  this.actorConflicts.set(actor, this.actorConflicts.get(actor).concat([conflict]));
}


class SchedulePage extends Component {

  constructor(props) {
      super(props);
      this.myRef = React.createRef();

      this.state = {
          loading: false,
          play: {name:'', description:'', created:null, actors: [], scenes:[]},
          playId: "",
          numHeatMaps: 1,
          selectedScene: null,
      };
    }


  componentDidMount() {
    this.setState({ loading: true });
    let playId = this.props.match.params.playId;
    this.show = this.props.firebase.db.collection("shows").doc(playId);
    this.unsubscribe = []
    this.unsubscribe.push(this.show.onSnapshot(snapshot => {
        const { name, description, created } = snapshot.data();
        let play = {
            name,
            description,
            created,
            actors: [],
            scenes: [],
        };
        this.unsubscribe.push(this.show.collection("actors").onSnapshot(snapshot => {
          snapshot.forEach(doc => {
            play.actors.push(doc.data().name);
          });
        }));
        this.unsubscribe.push(this.show.collection("scenes").orderBy("title").onSnapshot(snapshot => {
          snapshot.forEach(doc => {
            let title = doc.data().title;
            let notes = doc.data().notes;
            let blocking = doc.data().blocking;
            let table = doc.data().table;
            let characters = doc.data().characters;
            let tabled = doc.data().tabled;
            let blocked = doc.data().blocked;

            let scene = new Scene(title, table, blocking, notes, tabled, blocked);
            // Get all characters in this scene
            characters.forEach((character) => {
              this.unsubscribe.push(character.onSnapshot(charSnapshot => {
                scene.addCharacter(charSnapshot.data().name);
              }));
              // Get every actor that plays this character and add all conflicts they have
              this.unsubscribe.push(this.show.collection("actors").where("characters", "array-contains", character)
                      .onSnapshot(actorsSnapshot => {
                actorsSnapshot.forEach(actor => {
                  let actorName = actor.data().name;
                  scene.addActor(actorName);
                  let conflicts = actor.ref.collection("conflicts").orderBy("date");
                  this.unsubscribe.push(conflicts.onSnapshot(conflictsSnapshot => {
                    conflictsSnapshot.forEach(conflict => {
                      let date = conflict.data().date;
                      let start = conflict.data().start;
                      let end = conflict.data().end;
                      scene.addConflict(actorName, new Conflict(date, start, end, "regular"));
                      this.setState({
                        play,
                      })
                    });
                  }));
                  let recurringConflicts = actor.ref.collection("recurring unavailibilities");
                  this.unsubscribe.push(recurringConflicts.onSnapshot(recurringSnapshot => {
                    recurringSnapshot.forEach(conflict => {
                      let date = conflict.data().day;
                      let start = conflict.data().start;
                      let end = conflict.data().end;
                      scene.addConflict(actorName, new Conflict(date, start, end, "recurring"));
                      this.setState({
                        play,
                      })
                    })
                  }));
                })
              }));
            });
            play.scenes.push(scene);
          });
        }));
        this.setState({
          play,
          playId,
          loading: false,
        });
      }));
    }

  componentWillUnmount() {
      this.unsubscribe.forEach(unsub => unsub());
  }

  addHeatmap = (e) => {
    let num = this.state.numHeatMaps;
    this.setState({numHeatMaps: num+1});
  }

  removeHeatmap = (e) => {
      let num = this.state.numHeatMaps;
      if (num > 1) {
        this.setState({numHeatMaps: num-1});
      }
    }


  selectScene = (i) => {
    let selectedScene = this.state.selectedScene;
    if (selectedScene != null) {
      this.state.play.scenes[selectedScene].selected = false;
    }
    this.state.play.scenes[i].selected = true;
    this.setState({
        selectedScene: i,
    });
  }

  reorder = (list, startIndex, endIndex) => {
    console.log('here');
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    let items = this.reorder(
      this.state.play.scenes,
      result.source.index,
      result.destination.index
    );

    let play = this.state.play;
    play.scenes = items;

    this.setState({
      play,
    });
  }

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>
    }
    var scenesToShow;
    if (this.state.selectedScene == null) {
      scenesToShow = this.state.play.scenes;
    } else {
      scenesToShow = [this.state.play.scenes[this.state.selectedScene]]
    }
    if (this.state.loading) {
      return "loading...";
    }
    return (
      <Container fluid>
				<DragDropContext onDragEnd={this.onDragEnd}>
        <Row>
          <Col xs={12} xl={4}>
            <h1>Current Schedule</h1>
						<Calendar />
          </Col>
          <Col xs={12} xl={8}>
            <Row>
              <Col xs={12} xl={4}>
                <h1>Scenes</h1>
                    <Scenes values={this.state} selectScene={this.selectScene} />
              </Col>
              <Col>
                <Row>
                  <Col>
                    <div>
                      <h1>
                        Availability Heatmaps
                        <ButtonGroup className="float-right">
                          <Button variant="danger" size="sm" onClick={this.removeHeatmap}><FontAwesomeIcon icon={faMinus} /></Button>
                          <Button variant="success" size="sm" onClick={this.addHeatmap}><FontAwesomeIcon icon={faPlus} /></Button>
                        </ButtonGroup>
                      </h1>
                    </div>
                    {Array.from({ length: this.state.numHeatMaps},
                      (_, index) => <ActorHeatMap
                                    scenes = {scenesToShow}
                                    {...this.props}
                                    key={this.state.playId}
                                    />)}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <h1>Scene Info/Breakdown</h1>
                    <SceneInfo scenes={scenesToShow} />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
						</DragDropContext>
      </Container>
    );
  }
}

export default SchedulePage;
