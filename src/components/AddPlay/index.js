import React, { Component } from 'react';
import { withAuthUser, withAuthorization } from '../Session';
import { withFirebase } from '../Firebase';
import { Container, Row, Col} from 'react-bootstrap';
import * as ROUTES from '../../constants/routes';
import { withRouter } from 'react-router-dom';
import { firestore } from 'firebase';
import PlayName from './Steps/PlayName';
import PlayActor from './Steps/PlayActor';
import PlayScene from './Steps/PlayScene';
import ReviewPage from './Steps/Review';

const INITIAL_STATE = {
    name: '',
    email: "",
    description: '',
    error: '',
    step: 1,
    actors: [{name:"", email:"", characters:[""], notes:"", unavailibilities: []}],
    scenes: [{title:"", characters:[""], notes:"", block:0, table:0}],
    calendar: "",
}
class AddPlayPage extends Component {
  constructor(props) {
      super(props);
      this.state = { ...INITIAL_STATE};
  }

  nextStep = () => {
      const { step } = this.state;
      this.setState({
          step : step + 1
      });
  }

  prevStep = () => {
      const { step } = this.state;
      this.setState({
          step : step - 1
      });
  }

  onSubmit = event => {
    var characterMap = new Map();
    let characters = new Set();
    this.state.actors.forEach((actor) => {
      actor.characters.forEach((character) => {
        characters.add(character);
      })
    });
    characters = Array.from(characters).sort();

    let db = this.props.firebase.db;

    db.collection("shows").add({
        name: this.state.name,
        email: this.state.email,
        description : this.state.description,
        created: firestore.FieldValue.serverTimestamp(),
        creator: this.props.context.uid,
        calendar: this.state.calendar,
    })
    .then((showDocRef) => {
      let show = db.collection("shows").doc(showDocRef.id);
      characters.forEach((character, index) => {
        show.collection("characters").add({
          name: character,
        })
        .then((charDocRef) => {
          characterMap.set(character, charDocRef.id);
          if (characterMap.size === characters.length) {


            this.state.actors.forEach((actor, index) => {
              let actorCharArray = actor.characters.map((character) => {
                  let id = characterMap.get(character);
                  return show.collection("characters").doc(id);
              });
              show.collection("actors").add({
                name: actor.name,
                notes: actor.notes,
                email: actor.email,
                characters: actorCharArray,
              })
              .then((actorDocRef) => {
                actor.unavailibilities.forEach((unavailability, index) => {
                  show.collection("actors").doc(actorDocRef.id).collection("recurring unavailibilities").add({
                    day: unavailability.day,
                    start: unavailability.start,
                    end: unavailability.end,
                  });
                });
              })
            });
            this.state.scenes.forEach((scene, index) => {
              let sceneCharArray = scene.characters.map((character) => {
                  let id = characterMap.get(character);
                  return show.collection("characters").doc(id);
              });
              this.props.firebase.db.collection('shows').doc(showDocRef.id).collection("scenes").add({
                title: scene.title,
                notes: scene.notes,
                blocking: parseInt(scene.block),
                table: parseInt(scene.table),
                characters: sceneCharArray,
                blocked: false,
                tabled: false,
              });
            });
          }
        });
      });

    })
    .then(() => {
        this.props.history.push(ROUTES.PLAYS);
    })
    .catch(error => {
        console.log(error);
    });
  };

  onChange = (e) => {
    e.preventDefault();
    let collection = e.target.dataset.collection;
    if (collection != null) {
      let values = [...this.state[collection]];
      let elementID = e.target.dataset.elementid;
      let attr = e.target.dataset.attr;
      values[elementID][attr] = e.target.value;
      this.setState((prevState) => ({
       values
      }));
    } else {
      this.setState({ [e.target.name]: e.target.value })
    }
  }

  setCalendarId = (id) => {
    console.log("Setting calendar ID to " + id);
    this.setState({calendar: id});
  }

  updateCharacter = (e) => {
    e.preventDefault();
    let collection = e.target.dataset.collection;
    let values = [...this.state[collection]];
    let elementID = e.target.dataset.elementid;
    let charID = e.target.dataset.charrid;

    values[elementID]["characters"][charID] = e.target.value;
    this.setState((prevState) => ( {
      values
    }));
    e.stopPropagation();
  }

  updateUnavailibility = (e) => {
    e.preventDefault();
    let collection = e.target.dataset.collection;
    let values = [...this.state[collection]];
    let elementID = e.target.dataset.elementid;
    let timeID = e.target.dataset.timeid;

    let value = e.target.value;
    let timeattr  = e.target.dataset.timeattr;
    if (timeattr !== "day") {
      value = parseInt(value);
    }

    values[elementID]["unavailibilities"][timeID][timeattr] = value;
    this.setState((prevState) => ( {
      values
    }));
    e.stopPropagation();
  }



  addActor = (e) => {
    e.preventDefault();
    this.setState((prevState) => ({
      actors: [...prevState.actors, {name:"", email:"", characters:[""], notes:"", unavailibilities: []}],
    }));
  }

  addScene = (e) => {
    e.preventDefault();
    this.setState((prevState) => ({
      scenes: [...prevState.scenes, {title:"", characters:[""], notes:"", block:0, table:0}],
    }));
  }

  addCharacter = (type, i, e) => {
    e.preventDefault();
    let values = [...this.state[type]];
    values[i]["characters"] = [...this.state[type][i]["characters"], ""];
    this.setState((prevState) => ({
      values
    }));
  }

  deleteItem = (type, i, e) => {
    e.preventDefault();
    let values = [...this.state[type]];
    if (values.length === 1) {
      return;
    } else {
      let newValues = values.slice(0, i).concat(values.slice(i + 1, values.length));
      if (type === "scenes") {
        this.setState((prevState) => ({
            "scenes": newValues
        }));
      } else if (type === "actors") {
        this.setState((prevState) => ({
            "actors": newValues
        }));
      }
    }
  }

  removeCharacter = (type, i, charIndx, e) => {
    e.preventDefault();
    let values = [...this.state[type]];
    let characters = values[i]["characters"];
    if (characters.length === 1) {
      return;
    } else {
      let newCharacters = characters.slice(0, charIndx).concat(characters.slice(charIndx+1, characters.length));
      values[i]["characters"] = newCharacters;
      this.setState((prevState) => ({
        values
      }));
    }
  }

  addUnavailibility = (i, e) => {
    e.preventDefault();
    let actors = [...this.state.actors];
    actors[i]["unavailibilities"] = [...this.state.actors[i]["unavailibilities"], {day: "sunday", start:32400, end:32400}];
    this.setState((prevState) => ({
      actors
    }));
  }



  removeUnavailbility = (i, dataIndx, e) => {
    e.preventDefault();
    let actors = [...this.state.actors];
    let data = actors[i]["unavailibilities"];
    let newData = data.slice(0, dataIndx).concat(data.slice(dataIndx+1, data.length));
    actors[i]["unavailibilities"] = newData;
    this.setState((prevState) => ({
      actors
    }));
  }
  render() {
      return (
          <Container>
              <Row>
                  <Col>
                      {this.getStep()}
                  </Col>
              </Row>
              <Row>
                  <Col>
                      {this.error && <p>{this.error.message}</p>}
                  </Col>
              </Row>
          </Container>
      );
  }

  getStep() {
      const {
          name,
          description,
          actors,
          step,
          scenes,
          calendar,
          email,
      } = this.state;
      const values = { name, description, actors, scenes, calendar, email};
      switch (step) {
        case 1:
          return <PlayName
                  { ... this.props}
                  nextStep = {this.nextStep}
                  onChange = {this.onChange}
                  setCalendarId = {this.setCalendarId}
                  values = {values }
                  />
        case 2:
          return <PlayActor
                  nextStep = {this.nextStep}
                  prevStep = {this.prevStep}
                  onChange = {this.onChange}
                  addActor = {this.addActor}
                  addCharacter = {this.addCharacter}
                  removeCharacter = {this.removeCharacter}
                  updateCharacter = {this.updateCharacter}
                  addUnavailibility = {this.addUnavailibility}
                  removeUnavailbility = {this.removeUnavailbility}
                  updateUnavailibility = {this.updateUnavailibility}
                  deleteItem= {this.deleteItem}
                  values = {values}
                  />
        case 3:
          return <PlayScene
                  nextStep = {this.nextStep}
                  prevStep = {this.prevStep}
                  onChange = {this.onChange}
                  addScene= {this.addScene}
                  addCharacter = {this.addCharacter}
                  removeCharacter = {this.removeCharacter}
                  updateCharacter = {this.updateCharacter}
                  addUnavailibility = {this.addUnavailibility}
                  removeUnavailbility = {this.removeUnavailbility}
                  updateUnavailibility = {this.updateUnavailibility}
                  deleteItem= {this.deleteItem}
                  values = {values}
                  />
          case 4:
            return <ReviewPage
              nextStep = {this.nextStep}
              prevStep = {this.prevStep}
              values = {values}
              onChange = {this.onChange}
              onSubmit = {this.onSubmit}
              />
            //TODO: submit page
        default:
            return null;

      }

  }
}

const condition = authUser => !!authUser;

export default withAuthUser(withFirebase(withRouter(withAuthorization(condition)(AddPlayPage))));
