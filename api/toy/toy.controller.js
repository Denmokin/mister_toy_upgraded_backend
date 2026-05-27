import { toyService } from './toy.service.js'
import { logger } from '../../services/logger.service.js'

export async function getToys(req, res) {
    const queryOptions = _parseQueryParams(req.query)
    try {
        const toys = await toyService.query(queryOptions)
        res.send(toys)
    }
    catch (err) {
        logger.error('Had issues getting toys', err)
        res.status(500).send({ err: 'Had issues getting toys' })
    }
}

export async function getToyById(req, res) {
    const { id } = req.params
    try {
        const toy = await toyService.getById(id)
        res.send(toy)
    }
    catch (err) {
        logger.error(`Had issues getting toy:${id}`, err)
        res.status(500).send({ err: `Had issues getting toy:${id}` })
    }
}

export async function removeToy(req, res) {
    const { id } = req.params
    const { loggedinUser } = req
    try {
        await toyService.remove(id, loggedinUser)
        res.send({ msg: 'Toy removed', toyId: id })
    }
    catch (err) {
        logger.error(`Had issues removing toy:${id}`, err)
        res.status(500).send({ msg: `Had issues removing toy:${id}` })
    }
}

export async function addToy(req, res) {
    const toy = req.body
    const { loggedinUser } = req

    try {
        const toyToSave = await toyService.add(toy, loggedinUser)
        res.send(toyToSave)
    }
    catch (err) {
        logger.error(`Had issues adding toy`, err)
        res.status(400).send({ msg: 'Had issues adding toy' })
    }
}

export async function updateToy(req, res) {
    const toy = req.body
    const { loggedinUser } = req

    try {
        const toyToUpdate = await toyService.update(toy, loggedinUser)
        res.send(toyToUpdate)
    }
    catch (err) {
        logger.error(`Had issues updating toy`, err)
        res.status(400).send({ msg: 'Had issues updating toy' })
    }
}

export async function addToyMsg(req, res) {
    const { loggedinUser } = req
    try {
        const toyId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser,
            createdAt: Date.now(),
        }
        const savedMsg = await toyService.addToyMsg(toyId, msg)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to add toy massage', err)
        res.status(500).send({ err: 'Failed to add toy massage' })
    }
}

export async function removeToyMsg(req, res) {
    const { loggedinUser } = req
    try {
        const { id: toyId, msgId } = req.params

        const removedId = await toyService.removeToyMsg(toyId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove toy msg', err)
        res.status(500).send({ err: 'Failed to remove toy msg' })
    }
}

function _parseQueryParams(queryParams) {
    const filterBy = {
        txt: queryParams.txt || '',
        maxPrice: queryParams.maxPrice || Infinity,
        labels: queryParams.labels || [],
        inStock: queryParams.inStock || '',

        pageIdx: queryParams.pageIdx !== undefined ? +queryParams.pageIdx : undefined,
        pageSize: queryParams.pageSize !== undefined ? +queryParams.pageSize : undefined,
    }
    return { filterBy }
}