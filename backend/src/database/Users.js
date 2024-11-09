import { v4 as uuidv4 } from "uuid"
import assert from "assert"

const processReturnData = (userInfo) => {
    assert(userInfo.rows.length < 2)
    return userInfo.rows.length === 1 ? userInfo.rows[0] : null
}

export const getUserByCredentials = async(client, emailId, password) => {
    try {
        const userInfo = await client.query("select * from users where emailid = $1 and password = $2", [emailId, password])
        return processReturnData(userInfo)
    } catch (error) {
        throw new Error(`Error: Get User by credentials ${error}`)
    }
}

export const getUserByEmailId = async(client, emailId) => {
    try {
        const userInfo = await client.query("select * from users where emailid = $1", [emailId])
        return processReturnData(userInfo)
    } catch (error) {
        throw new Error(`Error: Get User by emailId ${error}`)
    }
}

export const getUserByUsername = async(client, username) => {
    try {
        const userInfo = await client.query("select * from users where username = $1", [username])
        return processReturnData(userInfo)
    } catch (error) {
        throw new Error(`Error: Get User by username ${error}`)
    }
}

export const getUserByUserId = async(client, userId) => {
    try {
        const userInfo = await client.query("select * from users where userid = $1", [userId])
        return processReturnData(userInfo)
    } catch (error) {
        throw new Error(`Error: Get User by UserId ${error}`)
    }
}

export const insertUserByCredentials = async(client, emailId, password, userName) => {
    try {
        const userInfo = await client.query("insert into users (userid, emailid, password, username, level, xp) values ($1, $2, $3, $4, $5, $6) returning *",
            [uuidv4(), emailId, password, userName, 0, 0]
        )
        return processReturnData(userInfo)
    } catch (error) {
        throw new Error(`Error: Insert User by credentials ${error}`)
    }
}

export const updateUserStats = async(client, userId, level, xp) => {
    try {
        const userInfo = await client.query("update users set level = $1, xp = $2 where userid = $3",
            [level, xp, userId]
        )
        return processReturnData(userInfo)
    } catch (error) {
        throw new Error(`Error: Update user stats ${error}`)
    }
}