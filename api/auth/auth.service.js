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
    if (!username || !password) throw new Error('Missing username or password')

    const lowercasedUsername = username.toLowerCase()
    logger.debug(`auth.service - login with username: ${lowercasedUsername}`)

    const user = await userService.getByUsername(lowercasedUsername)
    if (!user) throw new Error('Invalid username or password')

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error('Invalid username or password')

    const userToReturn = { ...user }
    delete userToReturn.password
    
    return userToReturn
}

async function signup(username, password, fullname) {
    const saltRounds = 10

    if (!username || !password || !fullname) throw new Error('Missing details')

    const lowercasedUsername = username.toLowerCase()
    logger.debug(`auth.service - signup with username: ${lowercasedUsername}, fullname: ${fullname}`)

    const exists = await userService.getByUsername(lowercasedUsername)
    if (exists) throw new Error('Username taken')

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.add({ username: lowercasedUsername, password: hash, fullname })
}

function getLoginToken(user) {
    const userInfo = { _id: user._id, fullname: user.fullname, isAdmin: user.isAdmin }
    return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
    try {
        if (!loginToken) return null
        const json = cryptr.decrypt(loginToken)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
    } catch (err) {
        logger.error('Invalid login token', err)
        return null
    }
}