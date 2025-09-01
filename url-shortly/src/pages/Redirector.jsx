import React, { useEffect, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { getByShortcode, recordClick } from '../utils/storage'
import { logEvent } from '../loggingMiddleware'
import { Box, Typography, Button, Alert } from '@mui/material'

export default function Redirector() {
  const { shortcode } = useParams()
  const [status, setStatus] = useState('checking') // checking | redirecting | error | expired | notfound
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function go() {
      logEvent('redirect_attempt', { shortcode })
      const item = getByShortcode(shortcode)
      if (!item) {
        setStatus('notfound')
        setMessage('Shortcode not found.')
        logEvent('redirect_notfound', { shortcode })
        return
      }
      if (item.expiresAt && Date.now() > item.expiresAt) {
        setStatus('expired')
        setMessage('Short link has expired.')
        logEvent('redirect_expired', { shortcode })
        return
      }
      // record click (metadata: referrer, language)
      const metadata = { referrer: document.referrer || '', language: navigator.language || '' }
      const ok = recordClick(shortcode, metadata)
      if (ok) logEvent('click_recorded', { shortcode, metadata })
      else logEvent('click_record_failed', { shortcode })

      setStatus('redirecting')
      // perform redirect after saving click
      // use location.assign to replace history
      window.location.assign(item.longUrl)
    }
    go()
  }, [shortcode])

  if (status === 'checking') {
    return <Typography>Checking link...</Typography>
  }
  if (status === 'redirecting') {
    return <Typography>Redirecting...</Typography>
  }
  return (
    <Box sx={{ mt: 3 }}>
      <Alert severity="error">{message}</Alert>
      <Button component={RouterLink} to="/" sx={{ mt: 2 }}>Back to Shortener</Button>
    </Box>
  )
}
