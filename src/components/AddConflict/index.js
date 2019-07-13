import React, { Component } from 'react';

import { withAuthUser, withAuthorization } from '../Session';
import { Container, Row, Col, Form, Alert, Button } from 'react-bootstrap';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from '../TimePicker';

import './index.css';


class PlaysPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
        loading: false,
        play: {name:"", description: "", created:"", actors:[],},
        actor: "",
        date: new Date(),
        start: 32400,
        end: 32400,
        results: [],
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
            loading: false,
        });
        });
    });
  }

  componentWillUnmount() {
      this.unsubscribe && this.unsubscribe();
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.show.collection("actors").where('name', '==', this.state.actor).onSnapshot(snapshot => {
      snapshot.forEach((doc) => {
        let actorId = doc.id;
        this.show.collection("actors").doc(actorId).collection("conflicts").add({
          date: new Date(this.state.date.toDateString()),
          start: parseInt(this.state.start),
          end: parseInt(this.state.end),
        })
        .then(() => {
          let newResults = [true].concat(this.state.results);
          this.setState({results: newResults});
        })
        .catch((error) => {
          console.log(error);
          let newResults = [false].concat(this.state.results);
          this.setState({results: newResults});
        })
      });
    });
  }

  updateActor = (e) => {
    this.setState({actor: e.target.value});
  }
  onChange = (date) => {
    this.setState({ date });
  }

  updateTime = (e) => {
    let type = e.target.dataset.name;
    if (type === 'start') {
      this.setState({ start: parseInt(e.target.value) });
    }
    if (type === 'end') {
      this.setState({ end: parseInt(e.target.value) });
    }
  }

  render() {
    const { loading, actor, start, end, results} = this.state;

    const cStyle = {marginBottom: '300px'};

    let isInvalid = start >= end || actor === "";

    return (
      <Container style={cStyle}>
        <Row>
          <Col>
            <h1>Conflict Form for {this.state.play.name}</h1>
            {loading && <div>Loading ...</div>}
            {results.map((response, indx) => {
              return response ? <Alert key={indx} variant="success">Conflict sent!</Alert> : <Alert key={indx} variant="danger">Something went wrong</Alert>
            })}
            <Form>
              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>Who are you?</Form.Label>
                  <Form.Control isInvalid={actor === ""} as="select" value={actor} onChange={this.updateActor}>
                    <option disabled value="">--</option>
                    {
                      this.state.play.actors.map((actor, indx) => {
                        return (<option key={indx} value={actor}>{actor}</option>);
                      })}
                    }
                  </Form.Control>
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>Date</Form.Label>
                  <br />
                  <Form.Control  as={DatePicker} selected={this.state.date} onChange={this.onChange}/>
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label>Start</Form.Label>
                  <TimePicker
                      start="9:00"
                      end="24:00"
                      step={15}
                      data-name="start"
                      value={start}
                      onChange={this.updateTime}
                   />
               </Form.Group>
               <Form.Group as={Col}>
                 <Form.Label>End</Form.Label>
                 <TimePicker
                      isInvalid = {start >= end}
                      start="9:00"
                      end="24:00"
                      step={15}
                      data-name="end"
                      value={end}
                      onChange={this.updateTime}
                   />
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col}>
                  <Button disabled={isInvalid} variant="success" onClick={this.onSubmit} type="submit">Submit</Button>
                </Form.Group>
              </Form.Row>
            </Form>
        </Col>
      </Row>
      </Container>
    );
  }
}


const condition = authUser => !!authUser;

export default withAuthUser(withAuthorization(condition)(PlaysPage));
