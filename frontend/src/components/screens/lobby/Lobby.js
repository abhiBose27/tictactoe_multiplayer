import { useCallback, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Loader } from "semantic-ui-react"
import { useNavigate } from "react-router-dom"
import PropTypes from "prop-types"
import { MESSAGES } from "../../../Messages"
import { Header } from "../../assets/Header"
import { ACTIONS } from "../../../Actions"
import { initState } from "../../../Reducer"


export const Lobby = ({socket}) => {
    const navigate             = useNavigate()
    const dispatch             = useDispatch()
    const { user }             = useSelector(state => state.user)
    const { userId, userName } = user

    const onGameStarted = useCallback(payload => {
        if (userId !== payload.crossPlayer.userId && userId !== payload.circlePlayer.userId)
            return
        dispatch({type: ACTIONS.ADD_GAME, payload: {
            gameId: payload.gameId,
            player1: {
                userId: payload.crossPlayer.userId,
                userName: payload.crossPlayer.userName
            }, 
            player2: {
                userId: payload.circlePlayer.userId,
                userName: payload.circlePlayer.userName
            }
        }})
    }, [dispatch, userId])

    useEffect(() => {
        if (sessionStorage.getItem("pageRefresh"))
            navigate("/", { replace: true })
    }, [navigate])

    useEffect(() => {
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data)
            const payload = message.payload
            switch (message.type) {
                case MESSAGES.GAME_STARTED:
                    onGameStarted(payload)
                    navigate(`/game/${payload.gameId}`, { replace: true })
                    break
                case MESSAGES.LOGOUT:
                    dispatch({type: ACTIONS.LOGIN,    payload: initState.isLoggedIn})
                    dispatch({type: ACTIONS.ADD_USER, payload: initState.user})
                    dispatch({type: ACTIONS.ADD_GAME, payload: initState.game})
                    navigate("/", { replace: true })
                    break
                default:
                    break
            }
        }
        socket.send(JSON.stringify({
            type: MESSAGES.JOIN_GAME,
            payload: {userId}
        }))
       
    }, [socket, dispatch, navigate, userId, onGameStarted])

    return (
        <>
            <Header socket={socket} userName={userName} userId={userId}/>
            <Loader className="ui active slow green massive double loader">Finding a player...</Loader>
        </>
    )   
}


Lobby.propTypes = {
    socket: PropTypes.object.isRequired
}
