# hlsjs-ipfs-loader
A [js-ipfs](https://github.com/ipfs/js-ipfs) loader for the
[hls.js](https://github.com/video-dev/hls.js) JavaScript HLS client

## Building

To build hlsjs-ipfs-loader,  make sure you have the latest version of npm
installed. Then simply run the following commands from the hlsjs-ipfs-loader
project root:
```
npm install
npm run build
```

This will write a self-contained JS bundle to dist/index.js

## Browser example
Include script tags for HLS.js, js-ipfs and hlsjs-ipfs-loader:
```
<script src="https://unpkg.com/ipfs/dist/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script src="dist/index.js"></script>
```

After including these dependencies, add your own script that hooks everything
up. Please see [this example](examples/basic_usage.html) for more details.

NOTE: Chrome's strict security policies block the example from running
locally, so you will either have to spin up a local web server to host it from
(unless you want to explicitly fiddle with the policies),
or run it in Firefox where this restriction currently doesn't exist.
