import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class InfoPage extends Component {
  render() {
    return (
      <div>
      { <Link to={ '/addconflict/' + this.props.values.playId }>Actor conflict submission page (send to actors!) </Link> }
      <hr />
      { <Link to={ '/edit-play/' + this.props.values.playId }>Edit this play </Link> }
      </div>
    );
  }
}

export default InfoPage;
