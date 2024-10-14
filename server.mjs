// Based on https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework

import { createReadStream, promises } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join } from 'node:path'

const PORT = 3000

const MIME_TYPES = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
}

const STATIC_PATH = join(process.cwd(), './public')

const toBool = [() => true, () => false]

const prepareFile = async url => {
  const paths = [STATIC_PATH, url]
  if (url === '/') {
    paths.push('index.html')
  }

  const filePath = join(...paths)
  const notFoundPath = join(STATIC_PATH, '/404.html')

  const pathTraversal = !filePath.startsWith(STATIC_PATH)
  const exists = await promises.access(filePath).then(...toBool)
  const found = !pathTraversal && exists

  const streamPath = found ? filePath : notFoundPath
  const ext = extname(streamPath).slice(1).toLowerCase()
  const stream = createReadStream(streamPath)

  return { found, ext, stream }
}

const server = createServer(async (req, res) => {
  const file = await prepareFile(req.url)
  const statusCode = file.found ? 200 : 404
  const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default
  res.writeHead(statusCode, { 'Content-Type': mimeType })
  file.stream.pipe(res)

  console.log(`${req.method} ${req.url} ${statusCode}`)
})

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`)
})
