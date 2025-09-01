import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Container } from '@mui/material'
import NavBar from './components/NavBar'
import Shortener from './pages/Shortener'
import Stats from './pages/stats'
import Redirector from './pages/Redirector'

export default function App() {
  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Routes>
          <Route path="/" element={<Shortener />} />
          <Route path="/stats" element={<Stats />} />
          {/* Redirector handles ANY path like /abcd1 and redirects if mapping exists */}
          <Route path="/:shortcode" element={<Redirector />} />
        </Routes>
      </Container>
    </>
  )
}
