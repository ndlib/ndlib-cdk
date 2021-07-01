const path = require('path')

// https://medium.com/radon-dev/redirection-on-cloudfront-with-lambda-edge-e72fd633603e
exports.handler = (event, context, callback) => {
  const { request } = event.Records[0].cf

  const parsedPath = path.parse(request.uri)
  let newUri

  // Set a default list of file extensions which can be accessed directly.
  let validExtensions = [
    '.html',
    '.js',
    '.json',
    '.css',
    '.jpg',
    '.jpeg',
    '.png',
    '.ico',
    '.map',
    '.txt',
    '.kml',
    '.svg',
    '.webmanifest',
    '.webp',
    '.xml',
    '.zip',
  ]
  // If an origin request header exists for x-file-extensions, use that list instead.
  if (
    request.origin &&
    request.origin.s3 &&
    request.origin.s3.customHeaders &&
    request.origin.s3.customHeaders['x-file-extensions'] &&
    request.origin.s3.customHeaders['x-file-extensions'][0]
  ) {
    const headerValue = request.origin.s3.customHeaders['x-file-extensions'][0].value
    if (headerValue) {
      validExtensions = headerValue.split(',')
    }
  }
  // if there is no extension or it is not in one of the extensions we expect to find on the
  // server.
  if (parsedPath.ext === '' || !validExtensions.includes(parsedPath.ext)) {
    newUri = path.join(parsedPath.dir, parsedPath.base, 'index.html')
  } else {
    newUri = request.uri
  }

  // Replace the received URI with the URI that includes the index page
  request.uri = newUri

  // Return to CloudFront
  return callback(null, request)
}
