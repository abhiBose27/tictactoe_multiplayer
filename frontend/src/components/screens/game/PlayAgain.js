import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { useNavigate } from "react-router"
import { useDispatch } from "react-redux"
import { Modal, Button, Icon, Progress } from "semantic-ui-react"
import { initUserState } from "../../../Reducer"
import { ACTIONS } from "../../../Actions"
import { sleep } from "../../../Helper"


export const PlayAgain = React.memo(({winner, user}) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [levelProgress, setLevelProgress] = useState({updatedXp: user.xp, updatedLevel: user.level})
    
    const onClick = (e, { color }) => {
        dispatch({type: ACTIONS.ADD_GAME, payload: initUserState.game})
        if (winner && user.userId === winner.userId)
            dispatch({type: ACTIONS.ADD_USER, payload: {...user, level: winner.level, xp: winner.xp}})
        navigate(color === "red" ? "/" : "/lobby", { replace: true })
    }

    useEffect(() => {
        const incrementLevel = async() => {
            if (winner && winner.userId === user.userId) {
                await sleep(1500)
                setLevelProgress({updatedXp: winner.xp, updatedLevel: winner.level})
            }
        }
        incrementLevel()
    }, [winner, user])

    return (
        <Modal className="ui small modal" open onClose={() => false}>
            <Modal.Content>
                <p className="play-again">
                    Play Again?
                </p>
                <Modal.Actions>
                    <Progress percent={levelProgress.updatedXp} label={`Lvl ${levelProgress.updatedLevel}`} progress indicating/>
                    <Button size="small" basic color="red" onClick={onClick}>
                        <Icon name="remove"/>No
                    </Button>
                    <Button size="small" basic color="green" onClick={onClick}>
                        <Icon name="checkmark"/>Yes
                    </Button>
                </Modal.Actions>
            </Modal.Content>
        </Modal>
    )
})

PlayAgain.propTypes = {
    user: PropTypes.object.isRequired,
    winner: PropTypes.object
}