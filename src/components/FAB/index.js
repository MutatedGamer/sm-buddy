import React, { Component } from 'react';
import * as ROUTES from '../../constants/routes';
import { Link, withRouter } from 'react-router-dom';
import {FloatingMenu, MainButton, ChildButton} from 'react-floating-button-menu';
import MdAdd from '@material-ui/icons/Add';
import MdClose from '@material-ui/icons/Clear';
import MdPerson from '@material-ui/icons/Person';

class FAB extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
        };
    }

    render() {
        return (
            <FloatingMenu
                slideSpeed={500}
                direction="up"
                spacing={8}
                isOpen={this.state.isOpen}
            >
                <MainButton
                iconResting={<MdAdd style={{ fontSize: 20 }} nativeColor="black" />}
                iconActive={<MdClose style={{ fontSize: 20 }} nativeColor="black" />}
                backgroundColor="white"
                onClick={() => this.props.history.push(ROUTES.ADD_PLAY)}
                size={56}
                />
                <ChildButton
                icon={<MdPerson style={{ fontSize: 20 }} nativeColor="black" />}
                backgroundColor="white"
                size={40}
                onClick={() => console.log('First button clicked')}
                />
            </FloatingMenu>
        );
    }
}

export default withRouter(FAB);