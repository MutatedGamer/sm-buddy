import React, { Component } from 'react';
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { Droppable } from 'react-beautiful-dnd';
import './index.css';



import BigCalendar from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';


const localizer = BigCalendar.momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(BigCalendar);


class Calendar extends Component {

	constructor (props) {
    super(props)
    this.state = {
      draggedEvent: null,
      events: [],
			stagedEvents: new Set(),
    }
    this.moveEvent = this.moveEvent.bind(this)
    this.newEvent = this.newEvent.bind(this)
		this.addScene = this.addScene.bind(this)
    this.getEvents();
  }

  getEvents() {
    console.log("getting events....");
    this.props.firebase.gapi.client.load('calendar', 'v3').then(() => {
      console.log("calendar loaded");
      this.props.firebase.gapi.client.calendar.events.list({
        calendarId: this.props.calendarId,
      }).then(response => {
        console.log(response);
        let events = this.state.events;
        console.log(events);
        response.result.items.forEach((item) => {
            events.push({
                'title': item.summary,
                'start': moment(item.start.dateTime).toDate(),
                'end': moment(item.end.dateTime).toDate(),
                'allDay': (item.start.dateTime == null),
                'id': item.id,
								'description': item.description
              });
          });
          console.log(events);
          this.setState({events});
      });
    });
  }

  handleDragStart = name => {
    console.log("started dragg");
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
				'description': body
			};
			console.log(event);
			events.push(event);
			this.state.stagedEvents.add(event);
			this.setState({events});
			this.props.handleClose()
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
		this.state.stagedEvents.add(updatedEvent);

    const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)

    this.setState({
      events: nextEvents,
    })
  }

  resizeEvent = ({ event, start, end }) => {
		const { events } = this.state

    const idx = events.indexOf(event)


    const updatedEvent = { ...event, start, end}
		this.state.stagedEvents.add(updatedEvent);

    const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)


    this.setState({
      events: nextEvents,
    })

    //alert(`${event.title} was resized to ${start}-${end}`)
  }

  newEvent(event) {
    let idList = this.state.events.map(a => a.id)
    let newId = Math.max(...idList) + 1
    let hour = {
      id: newId,
      title: 'New Event',
      allDay: event.slots.length === 1,
      start: event.start,
      end: event.end,
    }
		this.state.stagedEvents.add(hour)
    this.setState({
      events: this.state.events.concat([hour]),
    })
  }

	syncStagedEvent({ event, start, end, isAllDay: droppedOnAllDaySlot }) {
		let mStart = moment(start);
		let mEnd = moment(end);
		let startDate = droppedOnAllDaySlot ? {
			date: mStart.format("YYYY-MM-DD"),
		} : {
			dateTime: mStart.toISOString(),
		};

		let endDate = droppedOnAllDaySlot ? {
			date: mEnd.format("YYYY-MM-DD"),
		} : {
			dateTime: mEnd.toISOString(),
		};

		this.props.firebase.gapi.client.calendar.events.update({
				calendarId: this.props.calendarId,
				eventId: event.id,
				resource: {
					summary: event.title,
					description: event.description,
					start: startDate,
					end: endDate,
				},

		});
	}

	render() {
    return (

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
                  style={{ height: "100vh" }}
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

								      if (this.state.stagedEvents.has(event) ||
													!this.state.events.includes(event)){
								        newStyle.backgroundColor = "#c0e03f"
								      }

								      return {
								        className: "",
								        style: newStyle
								      };
								    }
								  }
                />
                <div style={{ visibility: 'hidden', height: 0 }}>
                  {provided.placeholder}
                </div>
            </div>
          )}
      </Droppable>
    )
  }

}

export default Calendar;
