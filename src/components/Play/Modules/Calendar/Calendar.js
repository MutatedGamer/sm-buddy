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
	    <div className="event" onClick={() => this.editEvent(event)} style={{height: "100%"}}>
	      <p>{event.title}</p>
	    </div>
	  )
	}

	EventWithDescription({ event }) {
	  return (
			<div className="event" onClick={() => this.editEvent(event)} style={{height: "100%"}}>
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
		const { events, stagedEvents, stagedEventsBackup } = this.state
		let event = this.state.editEvent

		if (event.title === title && event.description === description) {
			// If haven't changed anything
			this.handleModalClose()
			return
		}

    let idx = events.indexOf(event)
		if (idx === -1) {
			// Event was already staged before
			idx = stagedEvents.indexOf(event)
			stagedEvents.splice(idx, 1) // remove old staged event
		} else {
			// Event was not staged before
			stagedEventsBackup.push(event) // Backup unstaged version
			events.splice(idx, 1) // Remove old event
		}

    const updatedEvent = { ...event, title, description}

    const nextEvents = [...events]
    stagedEvents.push(updatedEvent)


    this.setState({
      events,
			stagedEvents,
			stagedEventsBackup
    })
		this.props.calendarHasChangedCallback(true)
		this.handleModalClose()
	}

	constructor (props) {
    super(props)
    this.state = {
      draggedEvent: null,
      events: [],
			stagedEvents: [],
			stagedEventsBackup: [],
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
				let stagedEvents = []
				let stagedEventsBackup = []
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
								'description': item.description,
								'canCancel': false
              });
          });
          this.setState(
						{ events,
							stagedEvents,
							stagedEventsBackup
						});
					this.props.calendarHasChangedCallback(false)
      });
    });
  }

  handleDragStart = name => {
    this.setState({ draggedEvent: name })
  }

	addScene({date, start, duration, title, body, id}) {
		date.setHours(0, 0, 0);
		let mDateStart = moment(date);
		let mDateEnd = moment(date);
		mDateStart.add(parseInt(start), 'seconds');
		mDateEnd.add(parseInt(start) + duration, 'seconds');
		let stagedEvents = this.state.stagedEvents;
		let event = {
				'title': title,
				'start': mDateStart.toDate(),
				'end': mDateEnd.toDate(),
				'allDay': false,
				'description': body,
				'id': null,
				'canCancel': true,
				'sceneId': id
			};
			this.setState({stagedEvents: stagedEvents.concat([event])});
			this.props.handleClose()
			this.props.calendarHasChangedCallback(true)
	}

	moveEvent({ event, start, end, isAllDay: droppedOnAllDaySlot }) {
		const { events, stagedEvents, stagedEventsBackup } = this.state

    let idx = events.indexOf(event)
		if (idx === -1) {
			// Event was already staged before
			idx = stagedEvents.indexOf(event)
			stagedEvents.splice(idx, 1) // remove old staged event
		} else {
			// Event was not staged before
			stagedEventsBackup.push(event) // Backup unstaged version
			events.splice(idx, 1) // Remove old event
		}


    let allDay = event.allDay

    if (!event.allDay && droppedOnAllDaySlot) {
      allDay = true
    } else if (event.allDay && !droppedOnAllDaySlot) {
      allDay = false
    }

    const updatedEvent = { ...event, start, end, allDay, canCancel: true}

		// Add updated event to staged events
    stagedEvents.push(updatedEvent)

    this.setState({
      events,
			stagedEvents,
			stagedEventsBackup
    })
		this.props.calendarHasChangedCallback(true)
  }

  resizeEvent = ({ event, start, end }) => {
		const { events, stagedEvents, stagedEventsBackup } = this.state

		let idx = events.indexOf(event)
		if (idx === -1) {
			// Event was already staged before
			idx = stagedEvents.indexOf(event)
			stagedEvents.splice(idx, 1) // remove old staged event
		} else {
			// Event was not staged before
			stagedEventsBackup.push(event) // Backup unstaged version
			events.splice(idx, 1) // Remove old event
		}


    const updatedEvent = { ...event, start, end, canCancel: true}

    stagedEvents.push(updatedEvent)


    this.setState({
      events,
			stagedEvents,
			stagedEventsBackup
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
			id: null,
			canCancel: true
    }
    this.setState({
      stagedEvents: this.state.stagedEvents.concat([newEvent]),
    })
		this.props.calendarHasChangedCallback(true)
  }

	async commitEvents() {
		this.props.calendarHasChangedCallback(false)
		// TODO: change in firestore
		console.log("Committing events")
		await asyncForEach(this.state.stagedEvents, async event => {
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
		this.props.commitStagedScenes();
		this.getEvents();
	}

	handleSelectEvent(event,target) {
		let obj = target.currentTarget;
		obj.getElementsByClassName('event')[0].click();
	}

	unstageEvent = () => {
		const event = this.state.editEvent
		const {events, stagedEvents, stagedEventsBackup} = this.state
		const backupIndex = stagedEventsBackup.indexOf(stagedEventsBackup.find(backupEvent => {
			return backupEvent.id !== null && backupEvent.id === event.id
		}))
		const stagedIndex = events.indexOf(event)

		// If was moved from Google Calendar
		if (backupIndex !== -1) {
			const oldEvent = stagedEventsBackup[backupIndex]
			events.push(oldEvent)
			stagedEventsBackup.splice(stagedIndex, 1)
		}

		// Remove from backup and staged
		stagedEvents.splice(stagedIndex, 1)

		if (stagedEvents.length === 0) {
			this.props.calendarHasChangedCallback(false)
		}

		this.setState({
			events,
			stagedEvents,
			stagedEventsBackup
		});

		if (event.sceneId !== null) {
			this.props.handleUnstageSceneCallback(event.sceneId)
		}
		this.handleModalClose()

	}

	render() {
    return (
		<React.Fragment>
			{this.state.showEditModal && <EditEventModal
				canCancel={this.state.editEvent.canCancel}
				show={this.state.showEditModal}
				event={this.state.editEvent}
				handleClose={this.handleModalClose}
				handleSubmit={this.handleModalSubmit}
				handleUnstage = {this.unstageEvent} /> }
      <Droppable droppableId="calendar">
          {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={{display: "block", transform: "none !important"}}
              >
                <DragAndDropCalendar
                  resizable
									selectable
                  localizer={localizer}
									popup={true}
                  events={this.state.events.concat(this.state.stagedEvents)}
                  onEventDrop={this.moveEvent}
                  onEventResize={this.resizeEvent}
									onSelectEvent={this.handleSelectEvent}
									onSelectSlot={this.newEvent}
                  defaultView={BigCalendar.Views.WEEK}
                  defaultDate={new Date()}
                  resizableAccessor={() => true}
                  views={{ month: true, week: true, day: true }}
                  style={{ height: "100%" }}
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

								      if (!this.state.events.includes(event)){
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
