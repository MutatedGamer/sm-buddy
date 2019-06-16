import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus} from '@fortawesome/free-solid-svg-icons'
import { ButtonGroup, Button, Col, Row, Container } from 'react-bootstrap';
import ActorHeatMap from '../Modules/ActorHeatMap/ActorHeatMap';
import Scenes from '../Modules/Scenes/Scenes';
import SceneInfo from '../Modules/SceneInfo/SceneInfo';
import Calendar from '../Modules/Calendar/Calendar';
import { DragDropContext } from 'react-beautiful-dnd';
import { Dimmer, Header, Icon, Segment } from 'semantic-ui-react'
import NewEventModal from '../Modules/NewEventModal';

// Conflict Class
function Conflict(date, start, end, type="regular") {
  if (type === "regular") {
    this.type = "regular";
    this.date = date.toDate();
  } else if (type === "recurring") {
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
    this.actorConflicts[actor] = [];
  }
}

Scene.prototype.addConflict = function(actor, conflict) {
  // assumes actor is already added to scene
  this.actorConflicts.set(actor, this.actorConflicts[actor].concat([conflict]));
}


class SchedulePage extends Component {

  constructor(props) {
      super(props);
      this.myRef = React.createRef();

      this.state = {
          loading: false,
          play: {name:'', description:'', created:null, actors: [], scenes:[], calendarId:null},
          playId: "",
          numHeatMaps: 1,
          scenesToShow: [],
          showAll: true,
          calendarOverlay: false,
          calendarId: null,
          showNewEventModal: false,
          modalScene: null,
      };
      this.handleModalClose = this.handleModalClose.bind(this);
    }


  async componentDidMount() {
    this.setState({ loading: true });
    let playId = this.props.match.params.playId;
    this.show = this.props.firebase.db.collection("shows").doc(playId);
    this.unsubscribe = []
    await this.unsubscribe.push(this.show.onSnapshot( async (snapshot) => {
        const { name, description, calendar, created } = snapshot.data();
        let play = {
            name,
            description,
            created,
            calendarId: calendar,
            actors: [],
            scenes: [],
        };
        await this.unsubscribe.push(this.show.collection("actors").onSnapshot(snapshot => {
          snapshot.forEach(doc => {
            play.actors.push(doc.data().name);
          });
        }));
        await this.unsubscribe.push(this.show.collection("scenes").orderBy("title").onSnapshot(snapshot => {
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
            characters.forEach(async (character) => {
              await this.unsubscribe.push(character.onSnapshot(charSnapshot => {
                scene.addCharacter(charSnapshot.data().name);
                this.setState({
                  play,
                });
              }));
              // Get every actor that plays this character and add all conflicts they have
              this.unsubscribe.push(this.show.collection("actors").where("characters", "array-contains", character)
                      .onSnapshot(async (actorsSnapshot) => {
                actorsSnapshot.forEach(async (actor) => {
                  let actorName = actor.data().name;
                  scene.addActor(actorName);
                  let conflicts = actor.ref.collection("conflicts").orderBy("date");
                  await this.unsubscribe.push(conflicts.onSnapshot(conflictsSnapshot => {
                    conflictsSnapshot.forEach(conflict => {
                      let date = conflict.data().date;
                      let start = conflict.data().start;
                      let end = conflict.data().end;
                      scene.addConflict(actorName, new Conflict(date, start, end, "regular"));
                      this.setState({
                        play,
                      });
                    });
                  }));
                  let recurringConflicts = actor.ref.collection("recurring unavailibilities");
                  await this.unsubscribe.push(recurringConflicts.onSnapshot(recurringSnapshot => {
                    recurringSnapshot.forEach(conflict => {
                      let date = conflict.data().day;
                      let start = conflict.data().start;
                      let end = conflict.data().end;
                      scene.addConflict(actorName, new Conflict(date, start, end, "recurring"));
                      this.setState({
                        play,
                      });
                    })
                  }));
                })
              }));
            });
            play.scenes.push(scene);
            this.setState({
              play,
            });
            this.updateScenesToShow();
          });
        }));
        this.setState({
          play,
          playId,
          loading: false,
        });
        this.updateScenesToShow();
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
    let play = this.state.play;
    let scene = play.scenes[i];
    let currentlySelected = scene.selected;
    if (currentlySelected) {
      scene.selected = false;
    } else {
      scene.selected = true;
    }
    this.setState({showAll: false}, this.updateScenesToShow);

  }

  selectAllScenes = () => {
    const selected = this.state.showAll;
    if (!selected) {
      this.state.play.scenes.forEach(scene => {
        scene.selected = false;
      });
      this.setState({showAll: true}, this.updateScenesToShow)
    }
  }

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  onDragUpdate = (update) => {
    if (!update.destination) {
      return;
    }

    if (update.destination.droppableId === "calendar") {
      this.setState({
        calendarOverlay: true,
      })
    } else {
      this.setState({
        calendarOverlay: false,
      })
    }
  }

  onDragEnd = (result) => {
    const { source, destination } = result;
    this.setState({
      calendarOverlay: false,
    })
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (source.droppableId === "scenes" && destination.droppableId === "calendar") {
      let scene = this.state.play.scenes[source.index];
      console.log(scene);
      this.setState({
        showNewEventModal: true,
        modalScene: scene,
        });
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

  updateScenesToShow() {
    var scenesToShow = [];
    if (this.state.showAll) {
      console.log("Showing all");
      scenesToShow = this.state.play.scenes;
    } else {
      this.state.play.scenes.forEach(scene => {
        if (scene.selected) {
          scenesToShow.push(scene);
        }
      })
    }
    this.setState({scenesToShow});
  }

  handleModalClose() {
    this.setState({ showNewEventModal: false });
  }

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>
    }

    if (this.state.loading) {
      return "loading...";
    }
    return (
      <Container fluid>
        {this.state.showNewEventModal && <NewEventModal
          show={this.state.showNewEventModal}
          scene={this.state.modalScene}
          handleClose={this.handleModalClose}
          handleSubmit={this.refs.calendar.addScene} /> }
				<DragDropContext onDragEnd={this.onDragEnd} onDragUpdate={this.onDragUpdate}>
        <Row>
          <Col xs={12} xl={4}>
            <h1>Current Schedule</h1>
            <Dimmer.Dimmable as={Segment} blurring dimmed={this.state.calendarOverlay}>
              {this.state.play.calendarId && <Calendar {... this.props} ref="calendar" handleClose={this.handleModalClose} calendarId={this.state.play.calendarId} /> }
              <Dimmer inverted active={this.state.calendarOverlay}>
                <Header as='h2' icon inverted>
                  <Icon name='plus' color="green"/>
                  <span style={{color: "black"}}>Add to schedule!</span>
                </Header>
              </Dimmer>
            </Dimmer.Dimmable>
          </Col>
          <Col xs={12} xl={8}>
            <Row>
              <Col xs={12} xl={4}>
                <h1>Scenes</h1>
                    <Scenes values={this.state} selectScene={this.selectScene} selectAllScenes={this.selectAllScenes} showAll={this.state.showAll} />
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
                                    {...this.props}
                                    scenes = {this.state.scenesToShow}
                                    key={index}
                                    />)}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <h1>Scene Info/Breakdown</h1>
                    <SceneInfo scenes={this.state.scenesToShow} />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
        <hr />
      </DragDropContext>
      </Container>
    );
  }
}

export default SchedulePage;
