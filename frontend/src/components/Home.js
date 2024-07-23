import "./styles.css"

import React, { useRef, useState } from "react"
import { Logo } from "./Logo"
import { Button, Divider, Form, Icon, Modal } from "semantic-ui-react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { v4 as uuidv4 } from "uuid"
import { ADD_USER } from "../Reducer"


export const Home = () => {
    const inputRef = useRef(null)
    const userId   = uuidv4()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [showUserNameModal, setShowUserNameModal] = useState(false)

    const triggerModal = (e) => {
        setShowUserNameModal(prevModalState => !prevModalState)
    }

    const onSubmit = (e) => {
        setShowUserNameModal(prevModalState => !prevModalState)
        const nickname = inputRef.current.value
        if (nickname === "") return
        dispatch({type: ADD_USER, payload: {user: {userId: userId, name: nickname}}})
        navigate("/lobby")
    }

    return (
            <div className="home">
                <Logo/>
                <Divider inverted vertical>Tic Tac Toe</Divider>
                <Button inverted color="green" basic size="massive" onClick={triggerModal}>
                    <Icon className="globe small icon"/>Join a Game
                </Button>
                <Modal size="tiny" open={showUserNameModal} onClose={triggerModal}>
                    <Modal.Content>
                    <Form size="large" onSubmit={onSubmit}>
                        <div className="field">
                            <input ref={inputRef} placeholder="Nickname" type="text"/>
                        </div>
                    <Button type="submit">Join</Button>
                    </Form>
                    </Modal.Content>
                </Modal>
            </div>
    )
}