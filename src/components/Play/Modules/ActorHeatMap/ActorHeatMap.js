
import React, { Component } from 'react';
import {  Col, Form } from 'react-bootstrap';
import HeatMap from 'react-heatmap-grid';
import { timeIntegerToString, findClosest } from '../../../../Helpers/helpers.js';
import DatePicker from "react-datepicker";
import TimePicker from '../../../TimePicker';
import "react-datepicker/dist/react-datepicker.css";
var moment = require('moment');

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

class ActorHeatMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startDate: new Date(),
      endDate: new Date(),
      startTime: 32400,
      endTime: 61200,
      granularity: 30,
    };
  }

  updateDateStart = (date) => {
    if (date === null) {
      return
    }
    if (date >= this.state.endDate) {
      this.setState({startDate: date, endDate: date});
    } else if (Math.abs(this.state.endDate - date) >= 1209600000) {
      // Disallow more than 2 week difference
      this.setState({startDate: date, endDate: date.addDays(14)})
    } else {
      this.setState({startDate: date});
    }
  }

  updateDateEnd = (date) => {
    if (date === null) {
      return
    }
    if (Math.abs(this.state.startDate - date) >= 1209600000) {
      // Disallow more than 2 week difference
      this.setState({startDate: date.addDays(-14), endDate: date})
    } else if (date >= this.state.startDate) {
      this.setState({endDate: date});
    } else {
      this.setState({startDate: date, endDate: date});
    }
  }

  updateTime = (e) => {
    let type = e.target.dataset.name;
    let time = parseInt(e.target.value);
    if (type === 'start') {
      if (time >= this.state.endTime) {
        this.setState({startTime: time, endTime: time})
      } else {
        this.setState({ startTime: time });
      }
    }
    if (type === 'end') {
      if (time <= this.state.startTime) {
        this.setState({startTime: time, endTime: time});
      } else {
        this.setState({ endTime: time });
      }
    }
  }

  updateGran = (e) => {
    let granularity = parseInt(e.target.value);
    this.setState({granularity});
  }


  render() {
    let {startDate, endDate, startTime, endTime, granularity} = this.state;
    let scenes = this.props.scenes;


    if (startTime > endTime) {
      startTime = endTime;
    }

    startDate = moment(startDate);
    endDate = moment(endDate);
    const xLabels = [];
    const days = [];
    var day = startDate;

    while (!day.isAfter(endDate, 'day')) {
      xLabels.push(day.format('MMM Do'));
      days.push(day);
      day = day.clone().add(1, 'd');
    }

    let yLabels = new Array(Math.floor((endTime - startTime)/(granularity*60))).fill(0)
                  .map((_, i) => timeIntegerToString(startTime + granularity*60*i));
    let times = new Array(Math.floor((endTime - startTime)/(granularity*60))).fill(0)
                  .map((_, i) => startTime + granularity*60*i);


    // Data by default assumes all actors can make it
    const actors = new Set();
    scenes.forEach(scene => {
      for (let actor of scene.actorConflicts.keys()) {
        actors.add(actor);
      };
    });


    const data = new Array(yLabels.length).fill(0)
          .map(() => new Array(xLabels.length).fill(actors.size));


    const accountedForConflicts = new Map();
    scenes.forEach(scene => {
      for (let actor of scene.actorConflicts.keys()) {
        if (!accountedForConflicts.has(actor)) {
          accountedForConflicts.set(actor, new Set());
        }
        scene.actorConflicts.get(actor).forEach(conflict => {

          // Get xLabel indexes
          const jIndices = [];
          for (var i = 0; i < days.length; i++) {
            if (conflict.type === "regular") {
              if (days[i].format('LL') === moment(conflict.date).format('LL')) {
                jIndices.push(i);
              }
            } else if (conflict.type === "recurring") {
              if (days[i].format('dddd').toLowerCase() === conflict.date.toLowerCase()) {
                jIndices.push(i);
              }
            }
          }
          //const j = days.indexOf(moment(conflict.date).format('LL'));

          const yStart = times.indexOf(findClosest(conflict.start, times));
          i = yStart;
          if (jIndices.length === 0 || i === -1) {
            return;
          }

          jIndices.forEach(j => {
            while (times[i] < conflict.end) {
              if (!accountedForConflicts.get(actor).has(JSON.stringify([i, j])) && times[i] + granularity*60 > conflict.start) {
                data[i][j] = data[i][j] - 1;
                accountedForConflicts.get(actor).add(JSON.stringify([i, j]));
              }
              i++;
              if (i === yLabels.length) {
                break;
              }
            }
          });

        });
      };
    });


    return (
      <div>
        <Form>
          <Form.Row>
            <Col>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                as={DatePicker}
                selected={this.state.startDate}
                data-i={0}
                data-pos="start"
                onChange={this.updateDateStart}
              />
            </Col>
            <Col>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                  as={DatePicker}
                  selected={this.state.endDate}
                  data-i={1}
                  data-pos="end"
                  onChange={this.updateDateEnd}
                />
            </Col>
            <Col key={"start-" + this.state.startTime}>
              <Form.Label>Start Time</Form.Label>
              <TimePicker
                start="9:00"
                end="24:00"
                step={60}
                data-name="start"
                defaultValue={String(this.state.startTime)}
                onChange={this.updateTime}
              />
            </Col>

            <Col key={"end-" + this.state.endTime}>
              <Form.Label>End Time</Form.Label>
              <TimePicker
                start="9:00"
                end="24:00"
                step={60}
                data-name="end"
                defaultValue={String(this.state.endTime)}
                onChange={this.updateTime}
              />
            </Col>
            <Col>
              <Form.Label>Granularity</Form.Label>
              <Form.Control
                as="select"
                value={this.state.granularity}
                onChange={this.updateGran}
              >
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
                <option value="60">60</option>
              </Form.Control>
            </Col>
          </Form.Row>
        </Form>
        <HeatMap
          xLabels={xLabels}
          xLabelWidth={80}
          yLabelWidth={65}
          yLabels = {yLabels}
          data = {data}
          width={10}
          xLabelsLocation={"top"}
          cellStyle={(background, value, min, max, data, x, y) => ({
            background: `rgb(40, 167, 59, ${1 - (max - value) / (max)})`,
            // margin: `${Math.abs(y%2 - 2)}px 0px ${1 - y%2}px 0px`,
            margin: `0px 0px 0x 0px`,
            border: `1px solid white`,
          })}
          title={(value, unit) => `${value}/${actors.size}`}
        />
        <hr />
      </div>
    );
  }
}

export default ActorHeatMap;
