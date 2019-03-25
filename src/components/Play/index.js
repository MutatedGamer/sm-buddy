import React, { Component } from 'react';

import { withRouter, Link } from 'react-router-dom';
import { withAuthUser, withAuthorization, withAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import { Container, Row, Col } from 'react-bootstrap';
import { Tab } from 'semantic-ui-react';
import InfoPage from './Tabs/Info';

class PlayPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
        loading: false,
        play: {},
        playId: "",
    };
  }


  componentDidMount() {
    this.setState({ loading: true });
    let playId = this.props.match.params.playId;
    this.show = this.props.firebase.db.collection("shows").doc(playId);
    this.unsubscribe = this.show.onSnapshot(snapshot => {
        const { name, description, created } = snapshot.data();
        let play = {
            name,
            description,
            created,
            actors: [],
        };
        this.show.collection("actors").get().then(snapshot => {
          snapshot.forEach(doc => {
            play.actors.push(doc.data().name);
          });
        }).then( () => {
          this.setState({
            play,
            playId,
            loading: false,
        });
        });
    });
  }

  componentWillUnmount() {
      this.unsubscribe && this.unsubscribe();
  }


  render() {
    const { plays, loading } = this.state;
    console.log('here');

    var panes = [
      { menuItem: 'Info', render: () => <Tab.Pane attached={false}><InfoPage values={this.state}/></Tab.Pane>},
      { menuItem: 'Tab 2', render: () => <Tab.Pane attached={false}>Tab 2 Content</Tab.Pane> },
      { menuItem: 'Tab 3', render: () => <Tab.Pane attached={false}>Tab 3 Content</Tab.Pane> },
    ];

    return (
        <Row>
          <Col>
            <h1>{this.state.play.name} Management Page</h1>
            <Tab menu={{ secondary: true, pointing: true}} panes={panes} />
        </Col>
      </Row>
    );
  }
}


const condition = authUser => !!authUser;

export default withRouter(withAuthUser(withAuthorization(condition)(PlayPage)));
