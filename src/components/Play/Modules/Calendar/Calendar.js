import React, { Component } from 'react';
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { Droppable } from 'react-beautiful-dnd';
import './index.css';
import EditEventModal from '../EditEventModal';
import BigCalendar from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';


const localizer = BigCalendar.momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(BigCalendar);


class Calendar extends Component {

	EventNoDescription({ event }) {
	  return (
	    <div onClick={() => this.editEvent(event)} style={{height: "100%"}}>
	      <p>{event.title}</p>
	    </div>
	  )
	}

	EventWithDescription({ event }) {
	  return (
			<div onClick={() => this.editEvent(event)} style={{height: "100%"}}>
	      <p>{event.title}</p>
	      {event.description && event.description}
	    </div>
	  )
	}

	editEvent(event) {
		this.setState({
			showEditModal: true,
			editEvent: event
		});
	}

	handleModalClose() {
		this.setState({showEditModal: false});
	}

	handleModalSubmit({title, description}){
		const { events } = this.state
		let event = this.state.editEvent

    const idx = events.indexOf(event)


    const updatedEvent = { ...event, title, description}

    const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)


    this.setState({
      events: nextEvents,
    })
		this.props.calendarHasChangedCallback(true)
		this.handleModalClose()
	}

	constructor (props) {
    super(props)
    this.state = {
      draggedEvent: null,
      events: [],
			eventsBackup: [],
			showEditModal: false,
			editEvent: null,
    }
    this.moveEvent = this.moveEvent.bind(this)
    this.newEvent = this.newEvent.bind(this)
		this.addScene = this.addScene.bind(this)
		this.commitEvents = this.commitEvents.bind(this)
		this.getEvents = this.getEvents.bind(this)
		this.EventNoDescription = this.EventNoDescription.bind(this)
		this.EventWithDescription = this.EventWithDescription.bind(this)
		this.editEvent = this.editEvent.bind(this)
		this.handleModalClose = this.handleModalClose.bind(this)
		this.handleModalSubmit = this.handleModalSubmit.bind(this)
    this.getEvents();
  }

  getEvents() {
    console.log("getting events....");
    this.props.firebase.gapi.client.load('calendar', 'v3').then(() => {
      this.props.firebase.gapi.client.calendar.events.list({
        calendarId: this.props.calendarId,
      }).then(response => {
        let events = []
        response.result.items.forEach((item) => {
						let allDay = item.start.dateTime == null;
						let startDate = allDay? item.start.date : item.start.dateTime
						let endDate = allDay? item.end.date : item.end.dateTime
            events.push({
                'title': item.summary,
                'start': moment(startDate).toDate(),
                'end': moment(endDate).toDate(),
                'allDay': allDay,
                'id': item.id,
								'description': item.description
              });
          });
          this.setState(
						{ events,
							eventsBackup: events.slice(0),
						});
					this.props.calendarHasChangedCallback(false)
      });
    });
  }

  handleDragStart = name => {
    this.setState({ draggedEvent: name })
  }

	addScene({date, start, duration, title, body}) {
		date.setHours(0, 0, 0);
		let mDateStart = moment(date);
		let mDateEnd = moment(date);
		mDateStart.add(parseInt(start), 'seconds');
		mDateEnd.add(parseInt(start) + duration, 'seconds');
		let events = this.state.events;
		let event = {
				'title': title,
				'start': mDateStart.toDate(),
				'end': mDateEnd.toDate(),
				'allDay': false,
				'description': body,
				'id': null,
			};
			this.setState({events: events.concat([event])});
			this.props.handleClose()
			this.props.calendarHasChangedCallback(true)
	}

	moveEvent({ event, start, end, isAllDay: droppedOnAllDaySlot }) {
		const { events } = this.state

    const idx = events.indexOf(event)
    let allDay = event.allDay

    if (!event.allDay && droppedOnAllDaySlot) {
      allDay = true
    } else if (event.allDay && !droppedOnAllDaySlot) {
      allDay = false
    }

    const updatedEvent = { ...event, start, end, allDay}

    const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)

    this.setState({
      events: nextEvents,
    })
		this.props.calendarHasChangedCallback(true)
  }

  resizeEvent = ({ event, start, end }) => {
		const { events } = this.state

    const idx = events.indexOf(event)


    const updatedEvent = { ...event, start, end}

    const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)


    this.setState({
      events: nextEvents,
    })
		this.props.calendarHasChangedCallback(true)

    //alert(`${event.title} was resized to ${start}-${end}`)
  }

  newEvent(event) {
    let newEvent = {
      title: 'New Event',
      allDay: event.slots.length === 1,
      start: event.start,
      end: event.end,
			id: null
    }
    this.setState({
      events: this.state.events.concat([newEvent]),
    })
		this.props.calendarHasChangedCallback(true)
  }

	async commitEvents() {
		console.log("Committing events")
		await asyncForEach(this.state.events, async event => {
			if (this.state.eventsBackup.includes(event)) {
				return
			}

			let mStart = moment(event.start);
			let mEnd = moment(event.end);
			let startDate = event.allDay ? {
				date: mStart.format("YYYY-MM-DD"),
			} : {
				dateTime: mStart.toISOString(),
			};

			let endDate = event.allDay ? {
				date: mEnd.format("YYYY-MM-DD"),
			} : {
				dateTime: mEnd.toISOString(),
			};

			if (event.id) {
				await this.props.firebase.gapi.client.calendar.events.update({
						calendarId: this.props.calendarId,
						eventId: event.id,
						resource: {
							summary: event.title,
							description: event.description,
							start: startDate,
							end: endDate,
						},
				});
			} else {
				await this.props.firebase.gapi.client.calendar.events.insert({
						calendarId: this.props.calendarId,
						resource: {
							summary: event.title,
							description: event.description,
							start: startDate,
							end: endDate,
						},
				});
			}
		});
		this.getEvents();
	}

	render() {
    return (
		<React.Fragment>
			{this.state.showEditModal && <EditEventModal
				show={this.state.showEditModal}
				event={this.state.editEvent}
				handleClose={this.handleModalClose}
				handleSubmit={this.handleModalSubmit} /> }
      <Droppable droppableId="calendar">
          {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={{display: "block", transform: "none !important"}}
              >
                <DragAndDropCalendar
                  selectable
                  resizable
                  localizer={localizer}
									popup={true}
                  events={this.state.events}
                  onEventDrop={this.moveEvent}
                  onEventResize={this.resizeEvent}
                  onSelectSlot={this.newEvent}
                  defaultView={BigCalendar.Views.WEEK}
                  defaultDate={new Date()}
                  resizableAccessor={() => true}
                  views={{ month: true, week: true, day: true }}
                  style={{ height: "2000px" }}
									step={5}
									timeslots={6}
									min={new Date('December 17, 1995 06:00:00')}
									eventPropGetter={
								    (event, start, end, isSelected) => {
								      let newStyle = {
								        backgroundColor: "#4483cc",
								        color: 'black',
								        borderRadius: "0px",
								        border: "none"
								      };

								      if (!this.state.eventsBackup.includes(event)){
								        newStyle.backgroundColor = "#c0e03f"
								      }

								      return {
								        className: "",
								        style: newStyle
								      };
								    }
								  }
									components = {
										{
											month: {event: this.EventNoDescription },
											week: {event: this.EventNoDescription},
											day: {event: this.EventWithDescription}
										}
									}
                />
                <div style={{ visibility: 'hidden', height: 0 }}>
                  {provided.placeholder}
                </div>
            </div>
          )}
      </Droppable>
		</React.Fragment>
    )
  }
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export default Calendar;
