const MESSAGES = {
    MOVE: "move",
    LOGIN: "login",
    LOGOUT: "logout",
    SIGNUP: "signup",
    GET_USERS: "get_users",
    EXIT_GAME: "exit_game",
    JOIN_GAME: "join_game",
    GAME_OVER: "game_over",
    GAME_ERROR: "game_error",
    GAME_ADDED: "game_added",
    GAME_STARTED: "game_started",
}

const ERRORS = {
    INVALID_SOCKET: "invalid_socket",
    INVALID_CREDENTIALS: "invalid_credentials",
    INVALID_MOVE: "invalid_move",
    INVALID_PARAMETERS: "invalid_parameters",
    INVALID_GAMEID: "invalid_game_id",
    MISMATCH_PASSWORDS: "missmatch_passwords",
    USER_REGISTERED: "user_registered",
    USERNAME_TAKEN: "username_taken",
    USER_LOGGED_IN: "user_logged_in",
    USER_LOGGED_OUT: "user_logged_out",
    USER_NOT_LOGGED_IN: "user_not_logged_in",
    USER_IN_GAME: "user_in_game",
    USER_NOT_IN_GAME: "user_not_in_game",
    GAME_FULL: "game_full"
}

module.exports = {
    MESSAGES,
    ERRORS
}