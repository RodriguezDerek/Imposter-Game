import './css/App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import GameRoom from './pages/GameRoom';
import Discussion from './components/Discussion';

export default function App() {
  return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/create" element={<CreateRoom />} />
                <Route path="/join" element={<JoinRoom />} />
                <Route path="/room/:roomCode" element={<GameRoom />} />
                <Route path="/discussion" element={<Discussion />} />
            </Routes>
        </Router>
    );
}
