import { BrowserRouter, Routes, Route } from "react-router-dom";

// pages and components
import Chats from './pages/Chats'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'

// React App
// include a Navbar at the top
// Home tag is for Homepage
function App() {
  return (
    <BrowserRouter>
        <Navbar />
          <Routes>
            <Route
              path='/'
              element={<Home />}
            />
            <Route
              path='/chats'
              element={<Chats />}
            />
            <Route
              path='/auth/login'
              element={<Login />}
            />
            <Route
              path='/auth/signup'
              element={<Signup />}
            />
          </Routes>
      </BrowserRouter>
  );
}

export default App;
