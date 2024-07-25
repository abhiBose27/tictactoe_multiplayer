import "fomantic-ui-css/semantic.css"

import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './components/Home';
import { useWindowSize } from './hooks/useWindowSize';
import { Game } from "./components/Game";
import { useWebSocket } from "./hooks/useWebSocket";
import { Lobby } from "./components/Lobby";


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
            <Router>
                <Routes>
                    <Route path="/" element={<Home/>}></Route>
                    <Route path="/lobby" element={<Lobby socket={socket}/>}></Route>
                    <Route path="/game/:gameId" element={<Game socket={socket}/>}></Route>
                </Routes>
            </Router>
        </div>
    )
}

export default App;
