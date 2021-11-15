'use strict'

class Database {
    constructor (IpfsHttpClient, OrbitDB) {
        this.OrbitDB = OrbitDB
        this.IpfsHttpClient = IpfsHttpClient
    }

    async create() {
        this.node = this.IpfsHttpClient.create({
            host: '127.0.0.1',
            port: '5001',
            protocol: 'http'
        });
        await this._init()
    }

    async _init () {
        this.orbitdb = await this.OrbitDB.createInstance(this.node)
        this.metrics = await this.orbitdb.keyvalue('zesty.metrics')
        await this.metrics.load()
    }

    getAdSpace(adSpace) {
        return this.metrics.get(adSpace)
    }

    async setAdSpace(adSpace, data) {
        return await this.metrics.set(adSpace, data)
    }

    async increment(adSpace) {
        const as = this.getAdSpace(adSpace)
        const dateString = new Date(2021, 11, 16).toDateString()
        if(!as) {
            let data = {}
            data[dateString] = 1
            return await this.setAdSpace(adSpace, data) // CID
        } else {
            if(as[dateString]) {
                as[dateString] += 1
            } else {
                as[dateString] = 1
            }
            return await this.setAdSpace(adSpace, as)
        }
    }

    getAllMetrics() {
        return this.metrics.all
    }
}

const IpfsHttpClient = require('ipfs-http-client')
const OrbitDB = require('orbit-db')

module.exports = exports = new Database(IpfsHttpClient, OrbitDB)
