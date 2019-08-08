'use strict'

class HlsjsIPFSLoader {
  constructor(config) {
    this.ipfs = config.ipfs
    this.hash = config.ipfsHash
    if (config.debug === false) {
      this.debug = function() {}
    } else if (config.debug === true) {
      this.debug = console.log
    } else {
      this.debug = config.debug
    }
  }

  destroy() {
  }

  abort() {
  }

  load(context, config, callbacks) {
    this.context = context
    this.config = config
    this.callbacks = callbacks
    this.stats = { trequest: performance.now(), retry: 0 }
    this.retryDelay = config.retryDelay
    this.loadInternal()
  }

  loadInternal() {
    const { stats, context, config, callbacks } = this

    stats.tfirst = Math.max(performance.now(), stats.trequest)
    stats.loaded = 0

    const urlParts = context.url.split("/")
    const filename = urlParts[urlParts.length - 1]

    getFile(this.ipfs, this.hash, filename, this.debug).then(res => {
      const data = (context.responseType === 'arraybuffer') ? res : buf2str(res)
      stats.loaded = stats.total = data.length
      stats.tload = Math.max(stats.tfirst, performance.now())
      const response = { url: context.url, data: data }
      callbacks.onSuccess(response, stats, context)
    }, console.error)
  }
}

function getFile(ipfs, rootHash, filename, debug) {
  debug(`Fetching hash for '${rootHash}/${filename}'`)
    
  return ipfs.ls(rootHash).then(res => {
    const link = res.find(({ name }) => (name === filename))

    if (link === undefined) {
      throw new Error(`File not found: ${rootHash}/${filename}`)
    }

    debug(`Requesting '${link.path}'`)

    return ipfs.cat(link.hash).then(value => {
      debug(`Received data for file '${link.path}' size: ${value.length}`)
      return value
    })
  })
}

function buf2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

exports = module.exports = HlsjsIPFSLoader
