import { useEffect, useState } from "react"


export const useWebSocket = () => {
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        const ws = new WebSocket("wss://tictactoemultiplayer-production.up.railway.app")
        ws.onopen = () => setSocket(ws)
        ws.onclose = () => setSocket(null)
    }, [])

    return socket
}