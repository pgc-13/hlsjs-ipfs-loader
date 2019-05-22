'use strict'

class HlsjsIPFSLoader {
  constructor(config) {
    this.ipfs = config.ipfs
    this.hash = config.ipfsHash
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
    var stats = this.stats,
        context = this.context,
        config = this.config,
        callbacks = this.callbacks

    stats.tfirst = Math.max(performance.now(), stats.trequest)
    stats.loaded = 0

    var urlParts = context.url.split("/")
    var filename = urlParts[urlParts.length - 1]

    getFile(this.ipfs, this.hash, filename, function(err, res) {
      if (err) {
        console.log(err);
        return
      }

      var data,len
      if (context.responseType === 'arraybuffer') {
        data = res
        len = res.length
      } else {
        data = buf2str(res)
        len = data.length
      }
      stats.loaded = stats.total = len
      stats.tload = Math.max(stats.tfirst, performance.now())
      var response = { url: context.url, data: data }
      callbacks.onSuccess(response, stats, context)
    })
  }
}

function getFile(ipfs, rootHash, filename, callback) {
  if (!callback) callback = function (err, res) {}
  console.log("Fetching hash for '" + rootHash + "/" + filename + "'")
  ipfs.object.get(rootHash, function(err, res) {
    if (err) return callback(err)

    var hash = null
    var fileSize, fileName

    res.links.forEach(function(link) {
      if (link.Name === filename) {
        hash = link.Hash
        fileSize = link.Tsize
        fileName = link.Name
        return false
      }
    });

    if (!hash) {
      var msg = "File not found: " + rootHash + "/" + filename
      return callback(new Error(msg), null)
    }

    console.log("Requesting '" + rootHash + "/" + filename + "'")

    var resBuf = new ArrayBuffer(fileSize)
    var bufView = new Uint8Array(resBuf)
    var offs = 0

    const stream = ipfs.catReadableStream(hash)
    console.log("Received stream for file '" + rootHash + "/" + fileName + "'")
    stream.on('data', function (chunk) {
      console.log("Received " + chunk.length + " bytes for file '" +
        rootHash + "/" + fileName + "'")
      bufView.set(chunk, offs)
      offs += chunk.length
    });
    stream.on('error', function (err) {
      callback(err, null)
    });
    stream.on('end', function () {
      callback(null, resBuf)
    });
  });
}

function buf2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

exports = module.exports = HlsjsIPFSLoader
