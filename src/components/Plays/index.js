import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import { withAuthUser, withAuthorization, withAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import { Container, Row, Col } from 'react-bootstrap';
import { Card } from 'semantic-ui-react';

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
  }

  componentWillUnmount() {
      this.unsubscribe && this.unsubscribe();
  }


  render() {
    const { plays, loading } = this.state;

    return (
        <Row>
          <Col>
            <h1>Admin</h1>
            {loading && <div>Loading ...</div>}
            <PlayList plays={plays} />
        </Col>
      </Row>
    );
  }
}

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

export default withAuthUser(withAuthorization(condition)(PlaysPage));
