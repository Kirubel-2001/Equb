import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Signin from './pages/Home/Signin'
import Home from './pages/Home/Home'
import Profile from './pages/Home/Profile'
import Signup from './pages/Home/Signup'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/signin" element={<Signin/>} />
        <Route path="/signup" element={<Signup/>} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
