export const ADD_USER = "add_user"

export const userReducer = (state = {}, action) => {
    switch (action.type) {
        case ADD_USER:
            return {...state, user: action.payload}    
        default:
            return state
    }
}