import React, { Component } from 'react';
import { AuthUserContext, withAuthorization } from '../Session';
import { withFirebase } from '../Firebase';
import { Container, Row, Col} from 'react-bootstrap';
import * as ROUTES from '../../constants/routes';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { firestore } from 'firebase';
import PlayName from './Steps/PlayName';
import PlayDescription from './Steps/PlayDescription';
import PlayActor from './Steps/PlayActor';

const INITIAL_STATE = {
    name: '',
    description: '',
    error: '',
    step: 3,
    actor: '',
}

class AddPlayPage extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    nextStep = () => {
        const { step } = this.state;
        this.setState({
            step : step + 1
        });
    }

    prevStep = () => {
        const { step } = this.state;
        this.setState({
            step : step - 1
        });
    }

    onSubmit = event => {
    event.preventDefault();
        this.props.firebase.db.collection("shows").add({
            name: this.state.name,
            description : this.state.description,
            created: firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
            this.setState({ ...INITIAL_STATE });
        })
        .then(() => {
            this.props.history.push(ROUTES.ADMIN);
        })
        .catch(error => {
            this.setState({ error });
        });
    };

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };


    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        {this.getStep()}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {this.error && <p>{this.error.message}</p>}
                    </Col>
                </Row>
            </Container>
        );
    }

    getStep() {
        const {
            name,
            description,
            error, 
            actor,
            step,
        } = this.state;
        const values = { name, description, actor};
        switch (step) {
            case 1:
                return <PlayName
                        nextStep = {this.nextStep}
                        onChange = {this.onChange}
                        values = {values }
                        />
            case 2:
                return <PlayDescription
                        nextStep = {this.nextStep}
                        prevStep = {this.prevStep}
                        onChange = {this.onChange}
                        values = {values}
                        />
                case 3:
                return <PlayActor
                        nextStep = {this.nextStep}
                        prevStep = {this.prevStep}
                        onChange = {this.onChange}
                        values = {values}
                        />
                //TODO: submit page
            default:
                return null;

        }

    }
}

const condition = authUser => !!authUser;

export default withFirebase(withRouter(withAuthorization(condition)(AddPlayPage)));