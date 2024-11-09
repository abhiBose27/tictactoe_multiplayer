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
import { gameReducer, initGameState, initUserState } from "../../../Reducer"
import { ACTIONS } from "../../../Actions"


export const Game = ({socket}) => {
    const navigate                  = useNavigate()
    const dispatch                  = useDispatch()
    const { user, game }            = useSelector(state => state.user)
    const [gameState, gameDispatch] = useReducer(gameReducer, initGameState(user.userId === game.player1.userId))
    const { userId, userName }      = user
    const {
        isGameLoading,
        gameMessage,
        playAgain, 
        winner, 
        board
    } = gameState

    const onGameOver = useCallback(async(payload) => {
        const winner    = payload.winner
        const isForfeit = payload.isForfeit
        if (winner) {
            gameDispatch({type: ACTIONS.GAME_WINNER, payload: {
                xp: winner.xp,
                level: winner.level,
                userId: winner.userId,
                winningPattern: winner.winningPattern
            }})
            if (winner.userId !== userId)
                gameDispatch({type: ACTIONS.GAME_MESSAGE, payload: "You lost"})
            else {
                if (isForfeit)
                    gameDispatch({type: ACTIONS.GAME_MESSAGE, payload: "Opponent left the game. You won"})
                else
                    gameDispatch({type: ACTIONS.GAME_MESSAGE, payload: "You won"})
                gameDispatch({type: ACTIONS.GAME_PLAY_FIREWORKS, payload: true})
            }
        }
        else 
            gameDispatch({type: ACTIONS.GAME_MESSAGE, payload: "Draw"})
        await sleep(winner && winner.userId === userId ? 6000 : 2000)
        gameDispatch({type: ACTIONS.GAME_PLAY_AGAIN, payload: true})
    }, [userId])

    const onMove = useCallback(payload => {
        const moveSymbol = payload.userId === game.player2.userId ? "O" : "X"
        const moveCoords = payload.move
        const newBoard = [...board]
        newBoard[moveCoords.row][moveCoords.col] = moveSymbol
        const message = payload.userId === userId ? "Opponent's Turn" : "Your Turn"
        gameDispatch({type: ACTIONS.GAME_BOARD,   payload: newBoard})
        gameDispatch({type: ACTIONS.GAME_MESSAGE, payload: message})
    }, [board, game, userId])

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
            const message        = JSON.parse(event.data)
            const messageType    = message.type
            const messagePayload = message.payload
            switch (messageType) {
                case MESSAGES.MOVE:
                    onMove(messagePayload)
                    break
                case MESSAGES.GAME_OVER:
                    await onGameOver(messagePayload)
                    break
                case MESSAGES.LOGOUT:
                    dispatch({type: ACTIONS.LOGIN, payload: initUserState.isLoggedIn})
                    dispatch({type: ACTIONS.ADD_USER, payload: initUserState.user})
                    dispatch({type: ACTIONS.ADD_GAME, payload: initUserState.game})
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
            {
                isGameLoading ?
                <>
                    <MessageHeader 
                        userId={userId} 
                        winner={winner} 
                        gameMessage={"Get Ready!"}
                    />
                    <GameLoading
                        userId={userId}
                        player1={game.player1} 
                        player2={game.player2}
                    />
                </> :
                <>
                    <MessageHeader 
                        userId={userId} 
                        winner={winner}
                        gameMessage={gameMessage}
                    />
                    <GamePlay
                        userId={userId}
                        socket={socket}
                        gameState={gameState}
                        player1={game.player1}
                        player2={game.player2}
                    />
                </>
            }
            {
                playAgain && 
                <PlayAgain
                    user={user}
                    winner={winner}
                />
            }
        </>
    )
}

Game.propTypes = {
    socket: PropTypes.object.isRequired
}