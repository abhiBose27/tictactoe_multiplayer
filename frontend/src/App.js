import "fomantic-ui-css/semantic.css"
import "./css/styles.css"
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './components/screens/home/Home';
import { useWindowSize } from './hooks/useWindowSize';
import { Game } from "./components/screens/game/Game";
import { useWebSocket } from "./hooks/useWebSocket";
import { Lobby } from "./components/screens/lobby/Lobby";


function App() {
    const windowSize = useWindowSize()
    const socket     = useWebSocket()
    return (
        <div style={{
            width: windowSize.width,
            height: windowSize.height,
            backgroundColor: "#0C0D24",
            color: "white",
        }}> 
            {socket && <Router>
                <Routes>
                    <Route path="/" element={<Home socket={socket}/>}></Route>
                    <Route path="/lobby" element={<Lobby socket={socket}/>}></Route>
                    <Route path="/game/:gameId" element={<Game socket={socket}/>}></Route>
                </Routes>
            </Router>}
        </div>
    )
}

export default App;
