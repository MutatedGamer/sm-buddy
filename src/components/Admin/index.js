import React, { Component } from 'react';

import { withAuthorization } from '../Session';
import { Row, Col } from 'react-bootstrap';
import { Card } from 'semantic-ui-react';
import FAB from '../FAB';

class AdminPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
        loading: false,
        users: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });


    this.unsubscribe = this.props.firebase.db.collection("users").onSnapshot(snapshot => {
        const users = [];
        snapshot.forEach((doc) => {
            const { email, username } = doc.data();
            users.push({
                key: doc.id,
                doc,
                email,
                username,
            });
        });
        this.setState({
            users,
            loading: false,
        });
    });
  }

  componentWillUnmount() {
      this.unsubscribe && this.unsubscribe();
  }


  render() {
    const { users, loading } = this.state;

    return (
            <Row>
                <Col>
                    <h1>Admin</h1>
        {loading && <div>Loading ...</div>}
        <UserList users={users} />
        <div className="fabContainer" style={fabStyle}>
            <FAB />
        </div>
                </Col>
            </Row>


    );
    }
}

const fabStyle = {
    position: 'fixed',
    bottom: 15,
    right: 15,
}

const UserList = ({ users }) => (
    <div className="d-flex flex-wrap justify-content-start">
        {users.map(user => (
            <div key={user.key} className="p-2">
                <Card>
                    <Card.Content header="User"></Card.Content>
                    <Card.Content description={user.username}></Card.Content>
                    <Card.Content description={user.email}></Card.Content>
                </Card>
            </div>
        ))}
    </div>
  );


const condition = authUser => !!authUser;

export default withAuthorization(condition)(AdminPage);
