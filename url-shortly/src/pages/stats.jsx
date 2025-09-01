import React, { useState, useEffect } from 'react'
import {
  Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, Box
} from '@mui/material'
import { listAll, removeShortcode, clearAll } from '../utils/storage'
import { logEvent } from '../loggingMiddleware'

export default function Stats() {
  const [store, setStore] = useState({})

  useEffect(() => {
    setStore(listAll())
  }, [])

  function refresh() {
    setStore(listAll())
  }

  function handleDelete(code) {
    removeShortcode(code)
    logEvent('short_deleted', { code })
    refresh()
  }

  function handleClearAll() {
    clearAll()
    logEvent('store_cleared', {})
    refresh()
  }

  const rows = Object.entries(store).map(([code, item]) => ({ code, ...item }))

  return (
    <Box>
      <Typography variant="h4" gutterBottom>URL Statistics</Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={refresh} sx={{ mr: 1 }}>Refresh</Button>
        <Button variant="contained" color="error" onClick={handleClearAll}>Clear All</Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Shortcode</TableCell>
              <TableCell>Original URL</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Clicks</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.code}>
                <TableCell>{r.code}</TableCell>
                <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.longUrl}</TableCell>
                <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                <TableCell>{r.expiresAt ? new Date(r.expiresAt).toLocaleString() : 'N/A'}</TableCell>
                <TableCell>{r.clicks?.length ?? 0}</TableCell>
                <TableCell>
                  {r.clicks && r.clicks.length > 0 ? (
                    <details>
                      <summary>View click rows</summary>
                      <ul>
                        {r.clicks.map((c, idx) => (
                          <li key={idx}>
                            {new Date(c.ts).toLocaleString()} — referrer: {c.referrer || 'direct'} — lang: {c.language || 'unknown'}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleDelete(r.code)} variant="outlined" color="error">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No shortened URLs yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}
