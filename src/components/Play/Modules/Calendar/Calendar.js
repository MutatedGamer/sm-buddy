import React, { Component } from 'react';
import { timeIntegerToString, findClosest } from '../../../../Helpers/helpers.js';
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css"


import HTML5Backend from 'react-dnd-html5-backend';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import BigCalendar from 'react-big-calendar-like-google'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';


const localizer = BigCalendar.momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(BigCalendar);

const events = [
  {
    'title': 'All Day Event very long title',
    'bgColor': '#ff7f50',
    'allDay': true,
    'start': new Date(2019, 3, 0),
    'end': new Date(2019, 3, 1)
  },


  {
    'title': 'DTS STARTS',
    'bgColor': '#dc143c',
    'start': new Date(2019, 3, 8, 0, 0, 0),
    'end': new Date(2019, 3, 8, 12, 0, 0)
	},

]

class DraggableWrapper extends React.Component {
  render() {
		return (
			<Draggable key={"fdds"} draggableId={"fdfs"} index={0}>
				{(provided, snapshot) => (
					<div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
							{this.props.children}
					</div>
				)}
			</Draggable>

		);
  }
}


let components = {
	eventWrapper: DraggableWrapper,
}


class Calendar extends Component {

	constructor (props) {
    super(props)
    this.state = {
      events: events
    }
this.moveEvent = this.moveEvent.bind(this)
    this.newEvent = this.newEvent.bind(this)
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

    const updatedEvent = { ...event, start, end, allDay }

    const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)

    this.setState({
      events: nextEvents,
    })

    // alert(`${event.title} was dropped onto ${updatedEvent.start}`)
  }

  resizeEvent = ({ event, start, end }) => {
    const { events } = this.state

    const nextEvents = events.map(existingEvent => {
      return existingEvent.id == event.id
        ? { ...existingEvent, start, end }
        : existingEvent
    })

    this.setState({
      events: nextEvents,
    })

    //alert(`${event.title} was resized to ${start}-${end}`)
  }

  newEvent(event) {
    // let idList = this.state.events.map(a => a.id)
    // let newId = Math.max(...idList) + 1
    // let hour = {
    //   id: newId,
    //   title: 'New Event',
    //   allDay: event.slots.length == 1,
    //   start: event.start,
    //   end: event.end,
    // }
    // this.setState({
    //   events: this.state.events.concat([hour]),
    // })
  }

	render() {
		return(
        <Droppable droppableId="cal">
        {(provided, snapshot) => (
        <div ref={provided.innerRef} >
						<DragAndDropCalendar
							components={components}
							selectable
							localizer={localizer}
							events={this.state.events}
							onEventDrop={this.moveEvent}
							resizable
							onEventResize={this.resizeEvent}
							onSelectSlot={this.newEvent}
							defaultView='week'
							defaultDate={new Date()}
						/>
					{provided.placeholder}
        </div>
        )}
			</Droppable>
		);
	}

}

export default Calendar;
