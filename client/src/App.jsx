import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {Signin} from './pages/Home/Signin'
import Home from './pages/Home/Home'
import Profile from './pages/Home/Profile'
import {SignUp} from './pages/Home/SignUp'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/signin" element={<Signin/>} />
        <Route path="/signup" element={<SignUp/>} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
