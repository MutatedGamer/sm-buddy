import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import { withAuthUser, withAuthorization } from '../Session';
import { withFirebase } from '../Firebase';
import { Row, Col, Alert } from 'react-bootstrap';
import { Card } from 'semantic-ui-react';
import FAB from '../FAB';


class PlaysPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
        loading: false,
        plays: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.unsubscribe = this.props.firebase.db.collection("shows").where("creator", "==", this.props.context.uid).onSnapshot(snapshot => {
        const plays = [];
        snapshot.forEach((doc) => {
            const { name, description, created } = doc.data();
            plays.push({
                key: doc.id,
                doc,
                name,
                description,
                created,
            });
        });
        this.setState({
            plays,
            loading: false,
        });
    });
    this.getEvents();
  }

  getEvents() {
    console.log("getting events");
    if (!this.props.firebase.gapi) {
      console.log("NO GAPI");
      return;
    }
    this.props.firebase.gapi.client.load('calendar', 'v3').then(() => {
      console.log("calendar loaded");
      this.props.firebase.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime'
      }).then(events => {
        console.log(events.result.items);
      });
    });
  }

  componentWillUnmount() {
      this.unsubscribe && this.unsubscribe();
  }


  render() {
    const { plays, loading } = this.state;
    const fabStyle = {
      position: 'fixed',
      bottom: 15,
      right: 15,
    }

    return (
        <Row>
          <Col>
            <h1>Admin</h1>
            {loading && <div>Loading ...</div>}
            {!loading && (plays.length > 0) ? <PlayList plays={plays} /> : <Placeholder />}
            <div className="fabContainer" style={fabStyle}>
                <FAB />
            </div>
        </Col>
      </Row>
    );
  }
}

const Placeholder = () => (
  <Alert variant="success">
    <Alert.Heading>Welcome to SM buddy!</Alert.Heading>
    <p>
      It looks like you don't have any plays made yet. Go ahead and click the plus button
      down in the bottom right of this page to get started on your adventure with SM Buddy!
    </p>
  </Alert>
)

const PlayList = ({ plays }) => (
    <div className="d-flex flex-wrap justify-content-start">
        {plays.map(play => {
          let created = play.created.toDate();
          return (
            <div key={play.key} className="p-2">
              <Link to={'/play/' + play.key}>
                <Card>
                  <Card.Content header={play.name} />
                  <Card.Content description={play.description} />
                  <Card.Content extra>Created: {created.toDateString()}</Card.Content>
                </Card>
              </Link>
            </div>
          );
        })}
    </div>
  );


const condition = authUser => !!authUser;

export default withFirebase(withAuthUser(withAuthorization(condition)(PlaysPage)));
