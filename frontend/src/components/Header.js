import React from "react"
import PropTypes from "prop-types"


export const Header = React.memo(({headerString}) => {
    return (
        <header>
            <p className="title">{headerString}</p>
        </header>
    )
})

Header.propTypes = {
    headerString: PropTypes.string.isRequired
}