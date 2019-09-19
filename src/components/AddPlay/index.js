import React, { Component } from 'react';

import { withAuthUser, withAuthorization } from '../Session';
import { withFirebase } from '../Firebase';
import { firestore } from 'firebase';
import PlayForm from '../PlayForm';
import * as ROUTES from '../../constants/routes';

const initialState = {
    name: '',
    email: "",
    description: '',
    error: '',
    step: 1,
    actors: [{name:"", email:"", characters:[""], notes:"", unavailibilities: []}],
    scenes: [{title:"", characters:[""], notes:"", blocking:0, table:0, blocked: false, tabled: false}],
    calendar: "",
    callLetters: new Map(),
    creator: "",
}

class AddPlayPage extends Component {
  constructor(props) {
      super(props);
      this.createPlay = this.createPlay.bind(this);
  }

  createPlay(play) {
    var characterMap = new Map();
    let characters = new Set();
    play.actors.forEach((actor) => {
      actor.characters.forEach((character) => {
        characters.add(character);
      })
    });
    characters = Array.from(characters).sort();

    let db = this.props.firebase.db;

    db.collection("shows").add({
        name: play.name,
        email: play.email,
        description : play.description,
        created: firestore.FieldValue.serverTimestamp(),
        creator: this.props.context.uid,
        calendar: play.calendar,
    })
    .then((showDocRef) => {
      let show = db.collection("shows").doc(showDocRef.id);
      characters.forEach((character, index) => {
        show.collection("characters").add({
          name: character,
          letters: play.callLetters.get(character)
        })
        .then((charDocRef) => {
          characterMap.set(character, charDocRef.id);
          if (characterMap.size === characters.length) {
            play.actors.forEach((actor, index) => {
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
            play.scenes.forEach((scene, index) => {
              let sceneCharArray = scene.characters.map((character) => {
                  let id = characterMap.get(character);
                  return show.collection("characters").doc(id);
              });
              this.props.firebase.db.collection('shows').doc(showDocRef.id).collection("scenes").add({
                title: scene.title,
                notes: scene.notes,
                blocking: parseInt(scene.blocking),
                table: parseInt(scene.table),
                characters: sceneCharArray,
                blocked: scene.blocked,
                tabled: scene.tabled,
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
  }

  render() {
    return <PlayForm initialState={initialState} onSubmit={this.createPlay} />
  }
};


export default withAuthUser(withFirebase(AddPlayPage));
