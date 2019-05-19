import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';
import { withAuthUser, withAuthorization } from '../Session';
import { Row, Col } from 'react-bootstrap';
import { Tab } from 'semantic-ui-react';
import InfoPage from './Tabs/Info';
import SchedulePage from './Tabs/Schedule';

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

        this.setState({
          play,
          playId,
          loading: false,
      });
    });
  }

  componentWillUnmount() {
      this.unsubscribe && this.unsubscribe();
  }


  render() {
    const { plays, loading } = this.state;

    var panes = [
      { menuItem: 'Info', render: () => <Tab.Pane attached={false}><InfoPage values={this.state}/></Tab.Pane>},
      { menuItem: 'Schedule', render: () => <Tab.Pane attached={false}><SchedulePage {... this.props} values={this.state} /></Tab.Pane> },
      { menuItem: 'Tab 3', render: () => <Tab.Pane attached={false}>Tab 3 Content</Tab.Pane> },
    ];

    return (
        <Row>
          <Col>
            <h1>{this.state.play.name} Management Page</h1>
            <Tab activeIndex={1} menu={{ secondary: true, pointing: true}} panes={panes} />
        </Col>
      </Row>
    );
  }
}


const condition = authUser => !!authUser;

export default withRouter(withAuthUser(withAuthorization(condition)(PlayPage)));
