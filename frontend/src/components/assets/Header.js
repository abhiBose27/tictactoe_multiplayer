import React from "react"
import PropTypes from "prop-types"
import { Menu, MenuItem, MenuMenu } from "semantic-ui-react"
import { MESSAGES } from "../../Messages"


export const Header = React.memo(({socket, userName, userId}) => {
    const onClickLogOut = (e) => {
        socket.send(JSON.stringify({
            type: MESSAGES.LOGOUT,
            payload: {userId}
        }))
    }

    return (
        <Menu borderless inverted size="massive">
            {userName && <MenuItem><p style={{fontStyle: "italic"}}>{`Hello ${userName}!`}</p></MenuItem>}
            <MenuMenu position="right">
                <MenuItem icon="log out" onClick={onClickLogOut}/>
                <MenuItem name="Help"/>
            </MenuMenu>
        </Menu>
    )
})

Header.propTypes = {
    socket  : PropTypes.object.isRequired,
    userName: PropTypes.string,
    userId  : PropTypes.string
}