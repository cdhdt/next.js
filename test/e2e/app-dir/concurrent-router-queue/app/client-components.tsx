'use client'

import { useEffect, useState } from 'react'

// Records uncaught window errors into the DOM so the test can assert on them
// in both dev and start modes (the navigator stub throws synchronously inside
// the Link click handler, which surfaces as an uncaught window error).
export function WindowErrorProbe() {
  const [messages, setMessages] = useState<string[]>([])
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      setMessages((prev) => [...prev, event.message])
    }
    window.addEventListener('error', onError)
    return () => window.removeEventListener('error', onError)
  }, [])
  return (
    <>
      {/* Always non-empty so the test can wait on it while the list is empty
          (Playwright treats an empty <ul> as hidden). */}
      <p id="window-error-count">{messages.length}</p>
      <ul id="window-errors">
        {messages.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
    </>
  )
}

// Invokes a Server Action directly so the test owns the returned promise and
// can render the rejection produced by the callServer stub.
export function ActionButton({ action }: { action: () => Promise<string> }) {
  const [result, setResult] = useState('')
  return (
    <>
      <button
        id="invoke-action"
        onClick={() => {
          action().then(
            (value) => setResult(`fulfilled: ${value}`),
            (error) => setResult(`rejected: ${error.message}`)
          )
        }}
      >
        Invoke server action
      </button>
      <p id="action-result">{result}</p>
    </>
  )
}
