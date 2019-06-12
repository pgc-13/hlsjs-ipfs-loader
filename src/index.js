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

    res.Links.forEach(function(link) {
      if (link.Name === filename) {
        hash = link.Hash.toString()
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
    
    const stream = ipfs.cat(hash);
    stream.then((value) => {
      console.log("Received data for file '" + rootHash + "/" + fileName + "' size: " + value.length)
      
      callback(null, value);
    }).catch((err) => {
      callback(err, null);
    })

  });
}

function buf2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

exports = module.exports = HlsjsIPFSLoader
