const AWS = require('aws-sdk') // eslint-disable-line node/no-unpublished-require
const s3 = new AWS.S3({ region: 'us-east-1', apiVersion: '2006-03-01' })
const path = require('path')

module.exports.getFromS3 = async (bucketName, objectPath) => {
  // The key for s3 documents does NOT include a root level slash at the beginning
  if (objectPath.startsWith('/')) {
    objectPath = objectPath.substring(1)
  }
  console.log('Fetch from s3:', bucketName + '/' + objectPath)
  return s3
    .getObject({
      Bucket: bucketName,
      Key: objectPath,
    })
    .promise()
}

const transclude = async (body, bucketName, parentDir) => {
  // Get the paths of files to include from strings like: <!--#include virtual="foo/bar.shtml" -->
  const includesRegex = /<!--\s?#include virtual="(.+?)"\s?-->/g
  const matches = Array.from(body.matchAll(includesRegex))

  // Fetch all included files
  const promises = matches.map(match => exports.getFromS3(bucketName, path.resolve(parentDir, match[1])))
  return Promise.all(promises).then(async s3results => {
    // Also need to transclude the included page if it is an shtml file
    const includedBodies = await s3results.map(async (response, index) => {
      const pageBody = response.Body.toString()
      const filepath = matches[index][1]
      console.log('retrieved', filepath)
      const pageDir = path.resolve(parentDir, path.dirname(filepath))
      const resultBody =
        path.extname(filepath) === '.shtml' ? await transclude(pageBody, bucketName, pageDir) : pageBody
      return resultBody
    })
    return Promise.all(includedBodies).then(async resolvedBodies => {
      resolvedBodies.forEach(async (includedBody, index) => {
        body = body.replace(matches[index][0], includedBody)
      })
      return body
    })
  })
}

module.exports.handler = async (event, context, callback) => {
  const request = event.Records[0].cf.request
  const uri = request.uri

  console.log('Request:', JSON.stringify(request, null, 2))
  if (uri === '/' || path.extname(uri) === '.shtml') {
    // Get the name of the origin bucket that was fetched from
    // Ex: hackathon-dev-site-333680067100.s3.us-east-1.amazonaws.com -> hackathon-dev-site-333680067100
    const bucketName = request.origin.s3.domainName.replace(/\.s3\..*\.amazonaws.com/, '')

    // Now get the requested file
    const filepath = uri === '/' ? '/index.shtml' : uri
    const response = await exports.getFromS3(bucketName, filepath)

    // Transclude any included files in the response body
    const modifiedBody = await transclude(response.Body.toString(), bucketName, path.dirname(filepath))
    return callback(null, {
      body: modifiedBody,
      bodyEncoding: 'text',
      status: '200',
      statusDescription: 'OK',
      headers: {
        'content-type': [
          {
            key: 'Content-Type',
            value: 'text/html; charset=UTF-8',
          },
        ],
        'cache-control': [
          {
            key: 'Cache-Control',
            value: 'max-age=3600',
          },
        ],
      },
    })
  } else {
    // Was not an shtml file so we can serve it up as is without additional processing
    return callback(null, request)
  }
}
