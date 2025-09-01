import React, { useState } from 'react'
import {
  Grid, Card, CardContent, TextField, Button, Typography, Box, Alert, Stack
} from '@mui/material'
import { createShortcode } from '../utils/storage'
import { logEvent } from '../loggingMiddleware'

function makeEmptyRow() {
  return { longUrl: '', validity: '', preferred: '' }
}

export default function Shortener() {
  const [rows, setRows] = useState([makeEmptyRow()])
  const [errors, setErrors] = useState([])
  const [results, setResults] = useState([])

  function addRow() {
    if (rows.length >= 5) return
    setRows(prev => [...prev, makeEmptyRow()])
  }
  function removeRow(i) {
    setRows(prev => prev.filter((_, idx) => idx !== i))
  }
  function updateRow(i, key, value) {
    const next = [...rows]
    next[i] = { ...next[i], [key]: value }
    setRows(next)
  }

  function validateUrl(u) {
    try {
      // Basic check
      const normalized = u.trim()
      if (!/^https?:\/\//i.test(normalized)) return false
      // rely on URL constructor to detect malformed
      new URL(normalized)
      return true
    } catch {
      return false
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors([])
    setResults([])

    const newErrors = []
    const created = []

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      if (!r.longUrl || !r.longUrl.trim()) {
        newErrors.push(`Row ${i + 1}: URL is required.`)
        logEvent('validation_error', { row: i + 1, reason: 'empty_url' })
        continue
      }
      // ensure starts with http/https; if not, fail validation (spec wants validation)
      if (!validateUrl(r.longUrl.trim())) {
        newErrors.push(`Row ${i + 1}: URL appears malformed. Make sure it starts with http:// or https://`)
        logEvent('validation_error', { row: i + 1, url: r.longUrl, reason: 'malformed_url' })
        continue
      }
      let validityInt = parseInt(r.validity, 10)
      if (r.validity === '' || Number.isNaN(validityInt) || validityInt <= 0) {
        validityInt = 30 // default
      }
      // preferred code check: done inside createShortcode
      const res = createShortcode(r.longUrl.trim(), validityInt, r.preferred.trim() || null)
      if (!res.success) {
        newErrors.push(`Row ${i + 1}: ${res.error}`)
        logEvent('creation_error', { row: i + 1, reason: res.error })
        continue
      }
      // success
      created.push({
        row: i + 1,
        code: res.code,
        url: r.longUrl.trim(),
        expiresAt: res.item.expiresAt
      })
      logEvent('short_created', { row: i + 1, code: res.code, url: r.longUrl.trim() })
    }

    if (newErrors.length) setErrors(newErrors)
    if (created.length) setResults(created)
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>URL Shortener</Typography>
        <Typography variant="body2" color="text.secondary">
          Shorten up to 5 URLs at once. Leave validity blank for default (30 minutes).
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {rows.map((row, i) => (
              <Card key={i} variant="outlined">
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <TextField
                        label={`Original URL (row ${i + 1})`}
                        fullWidth
                        required
                        value={row.longUrl}
                        onChange={(e) => updateRow(i, 'longUrl', e.target.value)}
                        placeholder="https://example.com/very/long/page"
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        label="Validity (minutes)"
                        fullWidth
                        value={row.validity}
                        onChange={(e) => updateRow(i, 'validity', e.target.value)}
                        placeholder="30"
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        label="Preferred shortcode (optional)"
                        fullWidth
                        value={row.preferred}
                        onChange={(e) => updateRow(i, 'preferred', e.target.value)}
                        placeholder="mycode123"
                      />
                    </Grid>

                    <Grid item xs={12} sx={{ textAlign: 'right' }}>
                      {rows.length > 1 && (
                        <Button onClick={() => removeRow(i)} sx={{ mr: 1 }}>
                          Remove
                        </Button>
                      )}
                      {i === rows.length - 1 && rows.length < 5 && (
                        <Button onClick={addRow} variant="outlined" sx={{ mr: 1 }}>
                          Add row
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained">Create Short Links</Button>
              <Button type="button" variant="outlined" onClick={() => { setRows([makeEmptyRow()]); setResults([]); setErrors([]); }}>
                Reset
              </Button>
            </Box>

            {errors.length > 0 && (
              <Box>
                {errors.map((err, idx) => <Alert severity="error" key={idx}>{err}</Alert>)}
              </Box>
            )}

            {results.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mt: 2 }}>Results</Typography>
                {results.map((r, idx) => (
                  <Card key={idx} variant="outlined" sx={{ mt: 1 }}>
                    <CardContent>
                      <Typography><strong>Shortcode:</strong> <a href={`${window.location.origin}/${r.code}`} target="_blank" rel="noreferrer">{window.location.origin}/{r.code}</a></Typography>
                      <Typography><strong>Original URL:</strong> {r.url}</Typography>
                      <Typography>
                        <strong>Expires at:</strong> {new Date(r.expiresAt).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Stack>
        </form>
      </Grid>
    </Grid>
  )
}
