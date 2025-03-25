import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {Signin} from './pages/Home/Signin'
import Home from './pages/Home/Home'
import Profile from './pages/Home/Profile'
import {SignUp} from './pages/Home/SignUp'
import { Header } from './components/Header'
import { ParticipantDashboard } from './pages/Dashboard/ParticipantDashboard'
import {About} from './pages/Home/About'
import { FindEqub } from './pages/Home/FindEqub'
import Contact from './pages/Home/Contact'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/signin" element={<Signin/>} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/header" element={<Header/>} />
        <Route path="/participant" element={<ParticipantDashboard/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/find" element={<FindEqub/>} />
        <Route path="/contact" element={<Contact/>} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
