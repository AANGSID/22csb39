import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NavBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          URL Shortly
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">Shorten</Button>
          <Button color="inherit" component={RouterLink} to="/stats">Statistics</Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
