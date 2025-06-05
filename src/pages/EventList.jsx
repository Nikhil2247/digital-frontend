import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from '../api/axios'

export default function EventList() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    axios.get('/events').then(res => setEvents(res.data))
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Events</h1>
      <Link to="/events/new" className="mb-4 inline-block bg-green-500 text-white p-2">New Event</Link>
      <ul>
        {events.map(ev => (
          <li key={ev.id} className="border-b py-2">
            <Link to={`/events/${ev.id}/edit`} className="text-blue-500 mr-4">Edit</Link>
            {ev.name} ({new Date(ev.startDate).toLocaleDateString()})
          </li>
        ))}
      </ul>
    </div>
  )
}