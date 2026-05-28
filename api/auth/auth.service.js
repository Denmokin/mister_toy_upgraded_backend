import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'

export const authService = {
    signup,
    login,
    getLoginToken,
    validateToken
}

const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Puk-1234')

async function login(username, password) {

    const lowercasedUsername = username.toLowerCase()

    logger.debug(`auth.service - login with username: ${lowercasedUsername}`)

    const user = await userService.getByUsername(lowercasedUsername)
    if (!user) throw new Error('Invalid username or password')

    const match = await bcrypt.compare(lowercasedUsername, user.password)
    if (!match) throw new Error('Invalid username or password')

    delete user.password
    return user
}

async function signup(username, password, fullname) {
    const saltRounds = 10

    if (!username || !password || !fullname) throw new Error('Missing details')

    const lowercasedUsername = username.toLowerCase()

    logger.debug(`auth.service - signup with username: ${lowercasedUsername}, fullname: ${fullname}`)

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.add({ username: lowercasedUsername, password: hash, fullname })
}

function getLoginToken(user) {
    const userInfo = { _id: user._id, fullname: user.fullname, isAdmin: user.isAdmin }
    return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
    try {
        const json = cryptr.decrypt(loginToken)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
    } catch (err) {
        console.log('Invalid login token')
    }
    return null
}