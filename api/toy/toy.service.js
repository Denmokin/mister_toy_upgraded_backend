import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'

export const toyService = {
	query,
	getById,
	remove,
	add,
	update,
	addMsg,
	removeMsg,
}

async function query({ filterBy = {} } = {}) {
	try {
		const collection = await dbService.getCollection('toys')

		const criteria = _buildCriteria(filterBy)

		const totalToys = await collection.countDocuments(criteria)

		let cursor = collection.find(criteria)

		let totalPages = 1

		if (filterBy.pageIdx !== undefined && filterBy.pageSize !== undefined) {
			const pageIdx = +filterBy.pageIdx
			const pageSize = +filterBy.pageSize

			cursor = cursor.skip(pageIdx * pageSize).limit(pageSize)
			totalPages = Math.ceil(totalToys / pageSize) || 1
		}

		const toys = await cursor.toArray()
		return { toys, totalPages }

	} catch (err) {
		logger.error('toyService.query failed:', err)
		throw err
	}
}

async function getById(toyId) {
	try {
		const collection = await dbService.getCollection('toys')
		const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
		toy.createdAt = toy._id.getTimestamp()
		return toy
	} catch (err) {
		logger.error(`while finding toy ${toyId}`, err)
		throw err
	}
}

async function remove(toyId) {
	try {
		const collection = await dbService.getCollection('toys')
		const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
		return deletedCount
	} catch (err) {
		logger.error(`cannot remove toy ${toyId}`, err)
		throw err
	}
}

async function add(toy) {
	try {
		const collection = await dbService.getCollection('toys')
		await collection.insertOne(toy)
		return toy
	} catch (err) {
		logger.error('cannot insert toy', err)
		throw err
	}
}

async function update(toy) {
	try {
		const { _id, ...toyToUpdate } = toy
		const collection = await dbService.getCollection('toys')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: toyToUpdate })
		return toy
	} catch (err) {
		logger.error(`cannot update toy ${toy._id}`, err)
		throw err
	}
}

async function addMsg(Id, msg) {
	try {
		msg.id = makeId()

		const collection = await dbService.getCollection('toys')
		await collection.updateOne(
			{ _id: ObjectId.createFromHexString(Id) },
			{ $push: { msgs: msg } })
		return msg
	} catch (err) {
		logger.error(`cannot add  msg ${Id}`, err)
		throw err
	}
}

async function removeMsg(Id, msgId) {
	try {
		const collection = await dbService.getCollection('toys')
		await collection.updateOne(
			{ _id: ObjectId.createFromHexString(Id) },
			{ $pull: { msgs: { id: msgId } } })
		return msgId
	} catch (err) {
		logger.error(`cannot add  msg ${Id}`, err)
		throw err
	}
}

function _buildCriteria(filterBy) {

	const criteria = {}

	if (filterBy.txt) {
		criteria.name = { $regex: filterBy.txt, $options: 'i' }
	}

	if (filterBy.inStock !== undefined && filterBy.inStock !== '') {
		criteria.inStock = filterBy.inStock === 'true' || filterBy.inStock === true
	}


	if (filterBy.labels?.length && !filterBy.labels.includes('')) {
		criteria.labels = { $in: filterBy.labels }
	}

	if (filterBy.maxPrice) {
		criteria.price = { $lte: +filterBy.maxPrice }
	}

	return criteria
}