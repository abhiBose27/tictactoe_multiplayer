import { useEffect, useState } from "react"


export const useWebSocket = () => {
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        const ws = new WebSocket("wss://tictactoe-multiplayer-klht.onrender.com")
        ws.onopen = () => setSocket(ws)
        ws.onclose = () => setSocket(null)
    }, [])

    return socket
}