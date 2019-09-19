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
import PlayCallLetters from './Steps/PlayCallLetters';
import ReviewPage from './Steps/Review';

class PlayForm extends Component {
  constructor(props) {
      super(props);
      this.state = { ...props.initialState};
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
    this.props.onSubmit(this.state);

  };

  onChange = (e) => {
    let collection = e.target.dataset.collection;
    if (collection != null) {
      let values = [...this.state[collection]];
      let elementID = e.target.dataset.elementid;
      let attr = e.target.dataset.attr;
      var newValue;
      if (e.target.type == "checkbox") {
        newValue = e.target.checked
      } else {
        newValue = e.target.value;
      }
      values[elementID][attr] = newValue;
      this.setState((prevState) => ({
       collection: values
      }));
    } else {
      this.setState({ [e.target.name]: e.target.value })
    }
  }

  setCalendarId = (id) => {
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
      scenes: [...prevState.scenes, {title:"", characters:[""], notes:"", blocking:0, table:0, blocked: false, tabled: false}],
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
        let scenes = this.state.scenes
        let newCharactersSet = new Set()
        newValues.forEach(actor => {
          actor.characters.forEach(character => {
            newCharactersSet.add(character)
          })
        })
        // For every character this actor played, if he/she is the only one
        // who played that character, remove the character from each scene
        this.state.actors[i].characters.forEach((character) => {
          if (!newCharactersSet.has(character)) {
            scenes.forEach(scene => {
              let characterIndex = scene.characters.indexOf(character)
              if (characterIndex > -1) {
                scene.characters =
                  scene.characters.slice(0, characterIndex)
                  .concat(scene.characters
                    .slice(characterIndex + 1, scene.characters.length));
              }
            })
          }
        })
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

  updateCallLetters = (character, e) => {
    e.preventDefault()
    const callLetters = this.state.callLetters;
    callLetters.set(character, e.target.value)
    this.setState((prevState) => ({
      callLetters
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
          callLetters,
      } = this.state;
      const values = { name, description, actors, scenes, calendar, email, callLetters};
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
          return <PlayCallLetters
                  { ... this.props }
                  nextStep = { this.nextStep }
                  prevStep = {this.prevStep}
                  updateCallLetters = { this.updateCallLetters }
                  values = { values }
                  />
        case 4:
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
          case 5:
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

export default withAuthUser(withFirebase(withRouter(withAuthorization(condition)(PlayForm))));
