import{ BrowserRouter,Routes,Route} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Newhome from './pages/Newhome';
import Upload from './pages/Upload';
import Verify from './pages/Verify';

export default function App() {
  return <BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/newhome" element={<Newhome />} />
    <Route path="/upload" element={<Upload />} />
    <Route path="/verify" element={<Verify />} />

  </Routes>
  </BrowserRouter>
}
