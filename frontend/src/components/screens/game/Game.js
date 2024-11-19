import PropTypes from "prop-types"
import { useDispatch, useSelector } from "react-redux"
import { useCallback, useEffect, useReducer } from "react"
import { useNavigate } from "react-router-dom"
import { MESSAGES } from "../../../Messages"
import { PlayAgain } from "./PlayAgain"
import { MessageHeader } from "./MessageHeader"
import { GameLoading } from "./GameLoading"
import { GamePlay } from "./GamePlay"
import { sleep } from "../../../Helper"
import { Header } from "../../assets/Header"
import { gameReducer, initGameState, initState } from "../../../Reducer"
import { ACTIONS } from "../../../Actions"


export const Game = ({socket}) => {
    const navigate                    = useNavigate()
    const dispatch                    = useDispatch()
    const { user, game }              = useSelector(state => state.user)
    const { userId, userName }        = user
    const { gameId, player1, player2} = game
    const [gameState, gameDispatch]   = useReducer(gameReducer, initGameState(userId === player1.userId))
    const {
        isGameLoading,
        gameMessage,
        playAgain, 
        gameResult, 
        board
    } = gameState

    const onGameOver = useCallback(async(payload) => {
        const winnerUserId   = payload.winnerUserId
        const isForfeit      = payload.isForfeit
        const winningPattern = payload.winningPattern
        const player1        = payload.crossPlayer
        const player2        = payload.circlePlayer
        if (payload.gameId !== gameId)
            return
        if (!winnerUserId)
            gameDispatch({type: ACTIONS.GAME_MESSAGE, payload: "Draw"})
        else if (winnerUserId !== userId)
            gameDispatch({type: ACTIONS.GAME_MESSAGE, payload: "You lost"})
        else if (isForfeit)
            gameDispatch({type: ACTIONS.GAME_MESSAGE, payload: "Opponent left the game. You won!"})
        else
            gameDispatch({type: ACTIONS.GAME_MESSAGE, payload: "You won!"})
        gameDispatch({type: ACTIONS.GAME_RESULT, payload: {
            isForfeit,
            winnerUserId,
            winningPattern,
            player1,
            player2
        }})
        gameDispatch({type: ACTIONS.GAME_PLAY_FIREWORKS, payload: winnerUserId === userId})
        await sleep(winnerUserId === userId ? 6000: 2000)
        gameDispatch({type: ACTIONS.GAME_PLAY_AGAIN, payload: true})
    }, [userId, gameId])

    const onMove = useCallback(payload => {
        if (payload.gameId !== gameId)
            return
        const moveSymbol   = payload.userId === game.player1.userId ? "X" : "O"
        const row          = payload.row
        const col          = payload.col
        const newBoard     = [...board]
        newBoard[row][col] = moveSymbol
        const message = payload.userId === userId ? "Opponent's Turn" : "Your Turn"
        gameDispatch({type: ACTIONS.GAME_BOARD,   payload: newBoard})
        gameDispatch({type: ACTIONS.GAME_MESSAGE, payload: message})
    }, [board, game, userId, gameId])

    useEffect(() => {
        if (sessionStorage.getItem("pageRefresh"))
            navigate("/", { replace: true })
    }, [navigate])

    useEffect(() => {
        const updateLoadingScreen = async() => {
            await sleep(3000)
            gameDispatch({type: ACTIONS.GAME_LOADING, payload: false})
        }
        updateLoadingScreen()
    }, [])

    useEffect(() => {
        socket.onmessage = async(event) => {
            const message = JSON.parse(event.data)
            const payload = message.payload
            console.log(payload)
            switch (message.type) {
                case MESSAGES.MOVE:
                    onMove(payload)
                    break
                case MESSAGES.GAME_OVER:
                    await onGameOver(payload)
                    break
                case MESSAGES.LOGOUT:
                    dispatch({type: ACTIONS.LOGIN, payload: initState.isLoggedIn})
                    dispatch({type: ACTIONS.ADD_USER, payload: initState.user})
                    dispatch({type: ACTIONS.ADD_GAME, payload: initState.game})
                    navigate("/", { replace: true })
                    break              
                default:
                    break
            }
        }
    }, [navigate, onGameOver, dispatch, onMove, socket])

    return (
        <>
            <Header socket={socket} userName={userName} userId={userId}/>
            <MessageHeader
                userId={userId}
                gameMessage={isGameLoading ? "Get Ready!" : gameMessage}
                winnerUserId={isGameLoading ? null : gameResult.winnerUserId}
            />
            {isGameLoading ? <GameLoading
                    userId={userId}
                    player1={player1} 
                    player2={player2}
                /> : <GamePlay
                    userId={userId}
                    socket={socket}
                    player1={player1}
                    player2={player2}
                    gameState={gameState}
                />
            }
            {playAgain && <PlayAgain
                    user={user}
                    gameResult={gameResult}
                />
            }
        </>
    )
}

Game.propTypes = {
    socket: PropTypes.object.isRequired
}