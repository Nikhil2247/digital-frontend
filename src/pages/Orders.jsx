import React, { useEffect, useState } from 'react'
import axios from '../api/axios'

export default function Orders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const fetch = () => axios.get('/orders').then(res => setOrders(res.data))
    fetch()

    const es = new EventSource('http://localhost:3000/notifications/sse')
    es.onmessage = e => {
      console.log('SSE message', e.data)
      fetch()
    }
    es.onerror = err => console.error('SSE error', err)

    return () => es.close()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Orders</h1>
      <ul>
        {orders.map(o => (
          <li key={o.id} className="border-b py-2">
            Table {o.table.number}: {o.status}
            <ul>
              {o.orderItems.map(it => (
                <li key={it.menuItem.id}>{it.menuItem.name} x{it.quantity}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
