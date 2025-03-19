import {BrowserRouter, Routes, Route} from 'react-router-dom'
import SignUp from './pages/Home/SignUp'
import Signin from './pages/Home/Signin'
import Home from './pages/Home/Home'
import Profile from './pages/Home/Profile'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/sign-in" element={<Signin/>} />
        <Route path="/sign-up" element={<SignUp/>} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
