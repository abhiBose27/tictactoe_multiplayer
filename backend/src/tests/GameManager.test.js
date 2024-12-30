const { GameManager } = require("../components/managers/GameManager")
const { MESSAGES, ERRORS } = require("../messages")

describe("check_params", () => {
    const gameManager = new GameManager(null)
    test("login_valid", () => {
        const mockMessage = {
            type: MESSAGES.LOGIN,
            payload: {
                emailId: "xyz@gmail.com",
                password: "xyz"
            }
        }
        expect(gameManager.isValidParams(mockMessage)).toBe(true)
    })

    test("login_more_than_required", () => {
        const mockMessage = {
            type: MESSAGES.LOGIN,
            payload: {
                emailId: "xyz@gmail.com",
                password: "xyz",
                confirmPassword: "xyz"
            }
        }
        expect(gameManager.isValidParams(mockMessage)).toBe(false)
    })

    test("login_less_than_required", () => {
        const mockMessage = {
            type: MESSAGES.LOGIN,
            payload: {
                emailId: "xyz@gmail.com",
            }
        }
        expect(gameManager.isValidParams(mockMessage)).toBe(false)
    })

    test("join_game_with_required_only", () => {
        const mockMessage = {
            type: MESSAGES.JOIN_GAME,
            payload: {
                userId: "xyz@gmail.com"
            }
        }
        expect(gameManager.isValidParams(mockMessage)).toBe(true)
    })

    test("join_game_with_optionals", () => {
        const mockMessage = {
            type: MESSAGES.JOIN_GAME,
            payload: {
                userId: "xyz@gmail.com",
                createLobby: true
            }
        }
        expect(gameManager.isValidParams(mockMessage)).toBe(true)
    })

    test("join_game_with_more_than_required_but_not_optionals", () => {
        const mockMessage = {
            type: MESSAGES.JOIN_GAME,
            payload: {
                userId: "xyz@gmail.com",
                password: "xyz"
            }
        }
        expect(gameManager.isValidParams(mockMessage)).toBe(false)
    })

    test("join_game_with_no_required_but_optionals", () => {
        const mockMessage = {
            type: MESSAGES.JOIN_GAME,
            payload: {
                createLobby: true
            }
        }
        expect(gameManager.isValidParams(mockMessage)).toBe(false)
    })

    test("join_game_with_more_than_required_with_optionals", () => {
        const mockMessage = {
            type: MESSAGES.JOIN_GAME,
            payload: {
                userId: "xyz@gmail.com",
                password: "xyz",
                createLobby: true
            }
        }
        expect(gameManager.isValidParams(mockMessage)).toBe(false)
    })

    test("incorrect_prop_types", () => {
        const mockMessage = {
            type: MESSAGES.JOIN_GAME,
            payload: {
                userId: "xyz@gmail.com",
                createLobby: 3
            }
        }
        expect(gameManager.isValidParams(mockMessage)).toBe(false)
    })

    test("move", () => {
        const mockMessage = {
            type: MESSAGES.MOVE,
            payload: {
                userId: "xyz@gmail.com",
                row: 0,
                col: 0
            }
        }
        expect(gameManager.isValidParams(mockMessage)).toBe(true)
    })

    test("get_users", () => {
        const mockMessage = {
            type: MESSAGES.GET_USERS,
        }
        expect(gameManager.isValidParams(mockMessage)).toBe(true)
    })
})