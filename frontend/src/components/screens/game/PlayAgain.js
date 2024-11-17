import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { useNavigate } from "react-router"
import { useDispatch } from "react-redux"
import { Modal, Button, Icon, Progress } from "semantic-ui-react"
import { initState } from "../../../Reducer"
import { ACTIONS } from "../../../Actions"
import { getInitialLevelProgress, sleep } from "../../../Helper"


export const PlayAgain = React.memo(({user, gameResult}) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userId, xp, level } = user
    const { player1, player2 }  = gameResult
    const [levelProgress, setLevelProgress] = useState(getInitialLevelProgress(userId, player1, player2, xp, level))
    
    const onClick = (e, { color }) => {
        dispatch({type: ACTIONS.ADD_GAME, payload: initState.game})
        dispatch({type: ACTIONS.ADD_USER, payload: {
            ...user,
            xp: levelProgress.updatedXp,
            level: levelProgress.updatedLevel,
        }})
        navigate(color === "red" ? "/" : "/lobby", { replace: true })
    }

    useEffect(() => {
        const incrementLevel = async() => {
            const player = userId === player1.userId ? player1 : player2
            await sleep(1500)
            setLevelProgress({
                updatedXp: player.xp,
                updatedLevel: player.level
            })
        }
        incrementLevel()
    }, [player1, player2, userId, dispatch])

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
    gameResult: PropTypes.object.isRequired
}