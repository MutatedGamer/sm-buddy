import React, { Component } from 'react';

import { withFirebase } from '../Firebase';

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
      <div>
        <h1>Admin</h1>

        {loading && <div>Loading ...</div>}

        <UserList users={users} />
      </div>
    );
    }
}


const UserList = ({ users }) => (
    <ul>
      {users.map(user => (
        <li key={user.key}>
          <span>
            <strong>E-Mail:</strong> {user.email}
          </span>
          <span>
            <strong>Username:</strong> {user.username}
          </span>
        </li>
      ))}
    </ul>
  );


export default withFirebase(AdminPage);