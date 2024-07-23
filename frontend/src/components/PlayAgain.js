import React from "react"
import PropTypes from "prop-types"
import { useNavigate } from "react-router"
import { Modal, Button, Icon } from "semantic-ui-react"

export const PlayAgain = React.memo(({playAgain}) => {
    const navigate = useNavigate()
    return (
        <Modal className="ui small modal" open={playAgain} onClose={()=> false}>
            <Modal.Content>
                <p className="play-again">
                    Play Again?
                </p>
                <Modal.Actions>
                    <Button basic color="red" onClick={() => navigate("/", {replace: true})}>
                        <Icon name="remove"/>No
                    </Button>
                    <Button basic color="green" onClick={() => navigate("/lobby", {replace: true})}>
                        <Icon name="checkmark"/>Yes
                    </Button>
                </Modal.Actions>
            </Modal.Content>
        </Modal>
    )
})

PlayAgain.propTypes = {
    playAgain: PropTypes.bool.isRequired
}