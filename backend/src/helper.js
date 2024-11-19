const checkParamsOptionals = (payload, optionalProps) => {
    for (const [optionalProp, propType] of Object.entries(optionalProps)) {
        if (!(optionalProp in payload))
            continue
        if(typeof payload[optionalProp] !== propType)
            return false
        if (typeof payload[optionalProp] === "string" && payload[optionalProp].length === 0)
            return false
    }
    return true
}

const checkParamsRequired = (payload, requiredProps) => {
    for (const [requiredProp, propType] of Object.entries(requiredProps)) {
        if (typeof payload[requiredProp] !== propType)
            return false
        if (typeof payload[requiredProp] === "string" && payload[requiredProp].length === 0)
            return false
    }
    return true
}

const isRequiredPropsInParams = (payload, requiredProps) => {
    return Object.keys(payload).toString() !== Object.keys(requiredProps).toString()
}

const getRouteConfig = () => {
    return {
        signup: {
            required: {
                emailId: "string",
                userName: "string",
                password: "string",
                confirmPassword: "string"
            }
        },
        login: {
            required: {
                emailId: "string",
                password: "string"
            }
        },
        logout: {
            required: {
                userId: "string"
            }
        },
        move: {
            required: {
                userId: "string",
                row: "number",
                col: "number"
            }
        },
        join_game: {
            required: {
                userId: "string"
            },
            optional: {
                createLobby: "boolean",
                existingGameId: "string"
            } 
        },
        exit_game: {
            required: {
                userId: "string"
            }
        }
    }
}

module.exports = {
    checkParamsOptionals,
    checkParamsRequired,
    isRequiredPropsInParams,
    getRouteConfig
}