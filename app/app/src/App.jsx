// import React from 'react'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import LandingPage from './pages/LandingPage'

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/dashboard" element={<div>Dashboard Coming Soon</div>} />
//       </Routes>
//     </Router>
//   )
// }

// export default App

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<div>Dashboard Coming Soon</div>} />
      </Routes>
    </Router>
  )
}

export default App