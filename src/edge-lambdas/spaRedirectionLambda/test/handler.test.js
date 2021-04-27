// To run this
// yarn run jest handler.test.js
//
const testHandler = require('../src/handler').handler;

// Function to make it easier to create test event objects
// to send to the test handler. Returns a cloudfront origin
// event object with the given uri.
describe('URL ReWrites', () => {
  process.env.EXTENSIONS = [
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
  ].join(',');

  const newTestEvent = uri => ({
    Records: [
      {
        cf: {
          response: {
            status: 200,
          },
          request: {
            uri: uri,
          },
        },
      },
    ],
  });

  // Array of requested URIs and what we expect the function to rewrite it to
  const testUris = [
    { test_uri: '', expected_uri: 'index.html' },
    { test_uri: '/', expected_uri: '/index.html' },
    { test_uri: '/sub_path', expected_uri: '/sub_path/index.html' },
    { test_uri: '/sub_path/', expected_uri: '/sub_path/index.html' },
    { test_uri: '/sub_path/sub_path', expected_uri: '/sub_path/sub_path/index.html' },
    { test_uri: '/sub_path/sub_path/', expected_uri: '/sub_path/sub_path/index.html' },
    { test_uri: '/page.html', expected_uri: '/page.html' },
    { test_uri: '/sub.path', expected_uri: '/sub.path/index.html' },
    { test_uri: '/1999.024', expected_uri: '/1999.024/index.html' },
    { test_uri: '/1239.024.534', expected_uri: '/1239.024.534/index.html' },
  ];

  // Loop through each of the test URIs and make sure the function under test rewrites
  // the request correctly
  testUris.forEach(testObj => {
    test('when URI "' + testObj.test_uri + '" is requested, rewrites to: "' + testObj.expected_uri + '"', () => {
      const testEvent = newTestEvent(testObj.test_uri);
      // When AWS executes a Lambda, it passes in a callback function to your handler. It
      // expects your handler to call the passed in function with the resultant data.
      // This is a mock callback that we'll pass to the handler we are testing so that we can
      // simulate what will happen when deployed. This mock function is where we inspect
      // the data that the handler will ultimately be returned to Cloudfront.
      const mockCallback = (ignore, data) => {
        expect(data).toEqual({ uri: testObj.expected_uri });
      };
      testHandler(testEvent, null, mockCallback);
    });
  });
});
