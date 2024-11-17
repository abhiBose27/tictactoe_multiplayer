import React, { useState } from "react"
import PropTypes from "prop-types"
import { Confirm, Menu, MenuItem, MenuMenu } from "semantic-ui-react"
import { MESSAGES } from "../../Messages"


export const Header = React.memo(({socket, userName, userId}) => {
    
    const [confirmDialogBox, setConfirmDialogBox] = useState(false)
    
    const onClickLogOut = (e) => {
        setConfirmDialogBox(prev => !prev)
    }

    const onConfirm = () => {
        socket.send(JSON.stringify({
            type: MESSAGES.LOGOUT,
            payload: {userId}
        }))
    }

    const onCancel = () => {
        setConfirmDialogBox(prev => !prev)
    }

    return (
        <>
            <Menu borderless inverted size="massive">
                {userName && <MenuItem><p style={{fontStyle: "italic"}}>{`Hello ${userName}!`}</p></MenuItem>}
                <MenuMenu position="right">
                    <MenuItem icon="log out" onClick={onClickLogOut}/>
                </MenuMenu>
            </Menu>
            <Confirm open={confirmDialogBox} onConfirm={onConfirm} onClose={() => false} onCancel={onCancel}/>
        </>
    )
})

Header.propTypes = {
    socket  : PropTypes.object.isRequired,
    userName: PropTypes.string,
    userId  : PropTypes.string
}