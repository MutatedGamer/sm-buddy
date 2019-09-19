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
    scenes: [{title:"", characters:[""], notes:"", block:0, table:0}],
    calendar: "",
    callLetters: new Map(),
}

class EditPlayPage extends Component {
  constructor(props) {
    super(props);
    this.savePlay = this.savePlay.bind(this);
    this.authorize = this.authorize.bind(this);

    this.state = {
        loading: true,
        playFormState: {},
        playId: "",
        creator: "",
        actorIds: new Map(),
        sceneIds: new Map(),
    };
  }

  authorize(authUser) {
    if (this.state.creator === "") {
      return true
    } else {
      return this.state.creator === authUser
    }
  }

  componentDidMount() {
    this.setState({ loading: true });
    let playId = this.props.match.params.playId;
    this.show = this.props.firebase.db.collection("shows").doc(playId);
    this.show.get().then(snapshot => {
        const { name, description, calendar, email, creator } = snapshot.data();
        let play = {
            name,
            email,
            description,
            error: "",
            step: 1,
            actors: [],
            scenes: [],
            calendar,
            callLetters: new Map()
        };
        this.setState({loading: false, playFormState: play, playId: snapshot.id});

        // Get actor info
        this.show.collection("actors").get().then(actorsSnapshot => {
          actorsSnapshot.docs.forEach(actorDoc => {
            this.setState({ loading: true });

            const {name, email, notes, characters } = actorDoc.data();
            let actorIds = this.state.actorIds;
            actorIds.set(name, actorDoc.id);
            this.setState(actorIds);

            const actorToAdd = {name, email, characters: [], notes, unavailibilities : []}
            play.actors.push(actorToAdd);

            // Get list of characters for actor
            characters.map(character => {
              character.get().then(characterSnapshop => {
                const {name, letters} = characterSnapshop.data();
                actorToAdd.characters.push(name);
                play.callLetters.set(name, letters)
              });
            });

            // Get list of recurring unavailibilities
            this.show.collection("actors").doc(actorDoc.id)
                .collection("recurring unavailibilities")
                .get().then(unavailabilitySnapshot => {
              unavailabilitySnapshot.docs.forEach(unavailability => {
                const {day, start, end} = unavailability.data();
                actorToAdd.unavailibilities.push({day, start, end});
              });
            });
          });
          this.setState({ loading: false });
        });

        // Get scene info
        this.show.collection("scenes").orderBy("title").get().then(sceneSnapshot => {
          this.setState({ loading: true });
          sceneSnapshot.docs.forEach(sceneDoc => {
            const {title, characters, notes, blocking, table, blocked, tabled } = sceneDoc.data();
            const sceneToAdd = {title, characters: [], notes, blocking, table, blocked, tabled};

            let sceneIds = this.state.sceneIds;
            sceneIds.set(title, sceneDoc.id);
            this.setState(sceneIds);

            play.scenes.push(sceneToAdd);

            // Get list of characters for scene
            characters.map(character => {
              character.get().then(characterSnapshop => {
                const {name, letters} = characterSnapshop.data();
                sceneToAdd.characters.push(name);
                play.callLetters.set(name, letters)
              });
            });
          });
          this.setState({ loading: false });
        });

    });
  }

  savePlay(play) {
    var characterMap = new Map();
    let characters = new Set();
    play.actors.forEach((actor) => {
      actor.characters.forEach((character) => {
        characters.add(character);
      })
    });
    characters = Array.from(characters).sort();

    let db = this.props.firebase.db;
    let batch = this.props.firebase.batch

    let show = db.collection("shows").doc(this.state.playId)

    // Update basic info that could have changed
    show.update({
        name: play.name,
        email: play.email,
        description : play.description,
        calendar: play.calendar,
    })
    .then(() => {
      // Insert all new characters
      let promises = characters.map(character => {
          return new Promise(function(resolve, reject) {
              show.collection("characters").add({
              name: character,
              letters: play.callLetters.get(character)
            }).then(charDocRef => {
              characterMap.set(character, charDocRef.id);
              resolve();
            });
          });
        })
      return Promise.all(promises)
    })
    .then(() => {
      console.log(characterMap)
      play.actors.forEach((actor, index) => {
        let actorCharArray = actor.characters.map((character) => {
            let id = characterMap.get(character);
            return show.collection("characters").doc(id);
        });

        // If name already existed, just update the information. Otherwise, we
        // need to add a new actor
        let oldActorId = this.state.actorIds.get(actor.name)
        let updateActorPromise = new Promise(function(resolve, reject) {
          if (oldActorId) {
            show.collection("actors").doc(oldActorId).update({
              name: actor.name,
              notes: actor.notes,
              email: actor.email,
              characters: actorCharArray,
            }).then(() => {
              // Delete all previous recurring unavailibilities
                show.collection("actors")
                  .doc(oldActorId).collection("recurring unavailibilities").get()
                  .then(snapshot => {
                    let promises = snapshot.docs.map(doc => {
                      return doc.ref.delete();
                    })
                    return Promise.all(promises)
                }).then(() => {
                  resolve(oldActorId)
                })
            })
          } else {
              show.collection("actors").add({
                name: actor.name,
                notes: actor.notes,
                email: actor.email,
                characters: actorCharArray,
              }).then((actorDocRef) => {
                resolve(actorDocRef.id);
              })
          }
        })
        updateActorPromise.then((actorId) => {
          actor.unavailibilities.forEach((unavailability, index) => {
            console.log("Adding unavailability")
            show.collection("actors").doc(actorId).collection("recurring unavailibilities").add({
              day: unavailability.day,
              start: unavailability.start,
              end: unavailability.end,
            });
          });
        })
      })
    })
    .then(() => {
      // Update scenes
      play.scenes.forEach((scene, index) => {
        let sceneCharArray = scene.characters.map((character) => {
            console.log(character)
            let id = characterMap.get(character);
            return show.collection("characters").doc(id);
        });

        // If title already existed, just update the information. Otherwise, we
        // need to add a new scene
        let oldSceneId = this.state.sceneIds.get(scene.title)
        let updatedScenePromise = new Promise(function(resolve, reject) {
          if (oldSceneId) {
            show.collection("scenes").doc(oldSceneId).update({
              title: scene.title,
              notes: scene.notes,
              blocking: parseInt(scene.blocking),
              table: parseInt(scene.table),
              characters: sceneCharArray,
              blocked: scene.blocked,
              tabled: scene.tabled,
            }).then(() => {
              resolve(oldSceneId)
            })
          } else {
              show.collection("scenes").add({
                title: scene.title,
                notes: scene.notes,
                blocking: parseInt(scene.blocking),
                table: parseInt(scene.table),
                characters: sceneCharArray,
                blocked: scene.blocked,
                tabled: scene.tabled,
              }).then((sceneDocRef) => {
                resolve(sceneDocRef.id);
              })
          }
        })
      })
    })
    .then(() => {
        this.props.history.push("/play/" + this.state.playId);
    })
    .catch(error => {
        console.log(error);
    });

      // characters.forEach((character, index) => {
      //   show.collection("characters").add({
      //     name: character,
      //     letters: play.callLetters.get(character)
      //   })
      //   .then((charDocRef) => {
      //     characterMap.set(character, charDocRef.id);
      //     if (characterMap.size === characters.length) {
      //       play.actors.forEach((actor, index) => {
      //         let actorCharArray = actor.characters.map((character) => {
      //             let id = characterMap.get(character);
      //             return show.collection("characters").doc(id);
      //         });
      //         show.collection("actors").add({
      //           name: actor.name,
      //           notes: actor.notes,
      //           email: actor.email,
      //           characters: actorCharArray,
      //         })
      //         .then((actorDocRef) => {
      //           actor.unavailibilities.forEach((unavailability, index) => {
      //             show.collection("actors").doc(actorDocRef.id).collection("recurring unavailibilities").add({
      //               day: unavailability.day,
      //               start: unavailability.start,
      //               end: unavailability.end,
      //             });
      //           });
      //         })
      //       });
      //       play.scenes.forEach((scene, index) => {
      //         let sceneCharArray = scene.characters.map((character) => {
      //             let id = characterMap.get(character);
      //             return show.collection("characters").doc(id);
      //         });
      //         show.collection("scenes").add({
      //           title: scene.title,
      //           notes: scene.notes,
      //           blocking: parseInt(scene.blocking),
      //           table: parseInt(scene.table),
      //           characters: sceneCharArray,
      //           blocked: scene.blocked,
      //           tabled: scene.tabled,
      //         });
      //       });
      //     }
      //   });
      // });

  }

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>
    }
    return <PlayForm initialState={this.state.playFormState} onSubmit={this.savePlay} />
  }
}

export default withAuthUser(withFirebase(EditPlayPage));
