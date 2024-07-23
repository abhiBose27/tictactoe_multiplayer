import PropTypes from "prop-types"
import { useNavigate, useLocation } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import { MOVE, GAME_OVER } from "../Messages"
import { useSelector } from "react-redux"
import { PlayAgain } from "./PlayAgain"
import { MessageHeader } from "./MessageHeader"
import { GameLoading } from "./GameLoading"
import { GamePlay } from "./GamePlay"
import { sleep } from "../Helper"
import { Header } from "./Header"


export const Game = ({socket}) => {
    const navigate  = useNavigate()
    const { state } = useLocation()
    const { user }  = useSelector(state => state.user)
    const { gameMetaData }                    = state.gameMetaData
    const { userId, name }                    = user.user
    const [gameStatus, setGameStatus]         = useState({
        userWon: false, 
        gameOver: false, 
        message: userId === gameMetaData.player1.userId ? "Your Turn": "Opponent's Turn"
    })
    const [isLoading, setIsLoading]           = useState(true)
    const [playAgain, setPlayAgain]           = useState(false)
    const [board, setBoard]                   = useState(Array(3).fill().map(() => Array(3).fill("")))
    const [playFireworks, setPlayFireworks]   = useState(false)
    const [winningPattern, setWinningPattern] = useState([])

    const gameOver = useCallback(async(payload) => {
        const winner         = payload.result
        const isForfeit      = payload.isForfeit
        const winningPattern = payload.winningPattern
        let userWon          = false
        let resultMessage    = ""
        if (!winner) 
            resultMessage += "Draw"
        else if (winner === userId) {
            if (isForfeit)
                resultMessage += "Opponent left the game. "
            resultMessage += "You won"
            userWon = true
            setPlayFireworks(true)
            setWinningPattern(winningPattern)
        }
        else
            resultMessage += "You lost"
        if (resultMessage !== "")
            setGameStatus({userWon: userWon, gameOver: true, message: resultMessage})
        const sleepMinutes = winner === userId ? 6000 : 3000
        await sleep(sleepMinutes)
        setPlayAgain(true)
    }, [userId])
    
    const updateMove = useCallback((payload) => {
        if (payload.userId === gameMetaData.player1.userId) {
            setBoard(prevBoard => {
                const move     = payload.move
                const newBoard = [...prevBoard]
                newBoard[move.row][move.col] = "X"
                return newBoard
            })
        }
        else if (payload.userId === gameMetaData.player2.userId) {
            setBoard(prevBoard => {
                const move     = payload.move
                const newBoard = [...prevBoard]
                newBoard[move.row][move.col] = "O"
                return newBoard
            })
        }
        if (payload.userId === userId)
            setGameStatus(prevStatus => { return {...prevStatus, message: "Opponent's Turn"}})
        else 
            setGameStatus(prevStatus => { return {...prevStatus, message: "Your Turn"}})
    }, [gameMetaData, userId])

    const onCellClick = (event) => {
        const id = event.target.id
        const { userId } = user.user
        const row = parseInt(id[0])
        const col = parseInt(id[1])
        socket.send(JSON.stringify({
            type: MOVE,
            payload: {
                userId: userId,
                move: {
                    row: row,
                    col: col
                }
            }
        }))
    }

    useEffect(() => {
        const updateLoadingScreen = async() => {
            await sleep(2000)
            setIsLoading(false)
        }
        updateLoadingScreen()
    }, [])

    useEffect(() => {
        const parseMessage = async(event) => {
            const message         = JSON.parse(event.data)
            const message_type    = message.type
            const message_payload = message.payload
            switch (message_type) {
                case MOVE:
                    updateMove(message_payload)
                    break
                case GAME_OVER:
                    await gameOver(message_payload)
                    break
                default:
                    break
            }
        }
        socket.addEventListener("message", parseMessage)
        return () => socket.removeEventListener("message", parseMessage)

    }, [navigate, socket, gameOver, updateMove])

    return (
        <>
            <Header headerString={"Tic Tac Toe"}/>
            <MessageHeader gameStatus={gameStatus}/>
            {
                isLoading ?
                <GameLoading gameMetaData={gameMetaData} userId={userId} name={name}/> :
                <GamePlay 
                    onCellClick={onCellClick} 
                    gameMetaData={gameMetaData} 
                    userId={userId} 
                    name={name} 
                    board={board} 
                    playFireworks={playFireworks}
                    winningPattern={winningPattern}
                />
            }
            <PlayAgain playAgain={playAgain}/>
        </>
    )
}

Game.propTypes = {
    socket: PropTypes.object
}