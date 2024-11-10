import PropTypes from "prop-types"
import image from "../../../images/tictactoe_image.png"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import React, { useState, useEffect } from "react"
import { Button, Icon } from "semantic-ui-react"
import { LoginForm } from "./LoginForm"
import { ERRORS, MESSAGES } from "../../../Messages"
import { ACTIONS } from "../../../Actions"
import { initUserState } from "../../../Reducer"


export const Home = ({socket, windowSize}) => {
    const [login, setLogin]         = useState(false)
    const [authError, setAuthError] = useState(null)
    const dispatch                  = useDispatch()
    const navigate                  = useNavigate()
    const { user, isLoggedIn }      = useSelector(state => state.user)
    const { userId, userName }      = user
    const { height, width }         = windowSize

    // For dynamic resolution
    const logoLength                = Math.min(width, height) * 0.6
    const fontSize                  = Math.min(width, height) * (isLoggedIn ? 0.06 : 0.08)

    const triggerModal = (e) => {
        setAuthError(null)
        setLogin(prevModalState => !prevModalState)
    }

    const onClickLogOut = (e) => {
        socket.send(JSON.stringify({
            type: MESSAGES.LOGOUT,
            payload: {userId}
        }))
    }
   
    const onClickPlayGame = (e) => {
        navigate("/lobby")
    }

    useEffect(() =>  {
        window.onbeforeunload = (e) => {
            e.preventDefault()
            sessionStorage.setItem("pageRefresh", "true")
        }
        return () => sessionStorage.clear()
    }, [])

    useEffect(() => {
        window.onpopstate = () => {
            socket.send(JSON.stringify({
                type: MESSAGES.EXIT_GAME,
                payload: {
                    userId: userId
                }
            }))
            navigate("/", { replace: true })
        }
    }, [userId, socket, navigate])

    useEffect(() => {
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data)
            const messageType = message.type
            const messagePayload = message.payload  
            switch (messageType) {
                case MESSAGES.LOGIN:
                case MESSAGES.SIGNUP:
                    setLogin(prevModalState => !prevModalState)
                    dispatch({type: ACTIONS.LOGIN, payload: true})
                    dispatch({type: ACTIONS.ADD_USER, payload: {
                        userId: messagePayload.userId, 
                        userName: messagePayload.userName, 
                        level: messagePayload.level,
                        xp: messagePayload.xp
                    }})  
                    break
                case MESSAGES.GAME_ERROR:
                    if (messagePayload.errorType === ERRORS.INVALID_CREDENTIALS || 
                        messagePayload.errorType === ERRORS.MISMATCH_PASSWORDS ||
                        messagePayload.errorType === ERRORS.USER_LOGGED_IN ||
                        messagePayload.errorType === ERRORS.USER_REGISTERED || 
                        messagePayload.errorType === ERRORS.USERNAME_TAKEN
                    )
                    setAuthError(messagePayload.message)
                    break
                case MESSAGES.LOGOUT:
                    dispatch({type: ACTIONS.LOGIN, payload: initUserState.isLoggedIn})
                    dispatch({type: ACTIONS.ADD_USER, payload: initUserState.user})
                    break
                default:
                    break;
            }   
        }
    }, [socket, dispatch, navigate])

    return (
            <div className="home">
                <img 
                    alt="logo"
                    src={image}
                    className="app-logo"
                    style={{height: logoLength, width: logoLength}}
                />
                <div>
                    <p style={{fontSize: fontSize}}>
                        {`Welcome to Tic Tac Toe ${userName ?? ""}`}
                    </p>
                    <div className="home-btns">
                        {isLoggedIn ? <>
                            <Button color="teal" size="large" onClick={onClickPlayGame}>
                                <Icon className="globe small icon"/>Join a Game
                            </Button>
                            <Button color="teal" size="large" onClick={onClickLogOut}>
                                <Icon className="log out icon"/>Log Out
                            </Button>
                        </> :
                        <Button color="teal" size="large" onClick={triggerModal}>
                            <Icon className="signup icon"/>Log In
                        </Button>}
                    </div>
                </div>
                {login && <LoginForm
                    socket={socket}
                    authError={authError}
                    windowSize={windowSize}
                    setAuthError={setAuthError}
                    triggerModal={triggerModal}
                />}
            </div>
    )
}

Home.propTypes = {
    socket: PropTypes.object.isRequired,
    windowSize: PropTypes.object.isRequired
}