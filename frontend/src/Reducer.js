import { ACTIONS } from "./Actions"

export const initUserState = {
    user: {
        xp: null,
        level: null,
        userId: null,
        userName: null
    },
    game: {
        isStarted: false, 
        gameId: null, 
        player1: { userId: null, userName: null }, 
        player2: { userId: null, userName: null }
    },
    isLoggedIn: false
}

export const initFormState = {
    signUp: {
        emailId: "",
        userName: "",
        password: "",
        confirmPassword: ""
    },
    login: {
        emailId: "",
        password: ""
    }
}

export const initGameState = (isPlayer1) => {
    return {
        winner: null,
        playAgain: false,
        isGameLoading: true,
        playFireworks: false,
        board: Array(3).fill().map(() => Array(3).fill("")),
        gameMessage: isPlayer1 ? "Your Turn": "Opponent's Turn"
    }
}

export const userReducer = (state = initUserState, action) => {
    switch (action.type) {
        case ACTIONS.ADD_USER:
            return {...state, user: action.payload}
        case ACTIONS.LOGIN:
            return {...state, isLoggedIn: action.payload}
        case ACTIONS.ADD_GAME:
            return {...state, game: action.payload}
        default:
            return state
    }
}

export const gameReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.GAME_MESSAGE:
            return {...state, gameMessage: action.payload}
        case ACTIONS.GAME_LOADING:
            return {...state, isGameLoading: action.payload}
        case ACTIONS.GAME_PLAY_AGAIN:
            return {...state, playAgain: action.payload}
        case ACTIONS.GAME_BOARD:
            return {...state, board: action.payload}
        case ACTIONS.GAME_PLAY_FIREWORKS:
            return {...state, playFireworks: action.payload}
        case ACTIONS.GAME_WINNER:
            return {...state, winner: action.payload}
        default:
            return state
    }
}