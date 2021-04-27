const lambdaHandler = require('../src/handler');

const hostname = 'www.example.com';
const indexBody = `
  <html>
  <body>
    <!--#include virtual="/include1.shtml" -->
    <div>This is an example.</div>
    <!-- #include virtual="/include2.shtml" -->
  </body>
  </html>
`;
const firstIncludeBody = `<div>
      <h1>Navigation or something</h1>
      <!-- #include virtual="/foo/nestedInclude.shtml"-->
    </div>
`;
const nestedIncludeBody = '<span>I go under the nav heading</span>';
const secondIncludeBody = '<div>a footer</div>';

const testEvent = {
  Records: [
    {
      cf: {
        response: {
          status: 200,
          body: indexBody,
        },
        request: {
          uri: '/index.shtml',
          headers: {
            host: [
              {
                key: 'Host',
                value: hostname,
              },
            ],
          },
          origin: {
            s3: {
              domainName: hostname,
            },
          },
        },
      },
    },
  ],
};

describe('transclusionLambda handler', () => {
  beforeEach(() => {
    console.log = jest.fn();
    lambdaHandler.getFromS3 = jest.fn().mockImplementation((bucketName, objectPath) => {
      let responseBody;
      switch (objectPath) {
        case '/':
        case '/index.shtml':
          responseBody = indexBody;
          break;
        case '/include1.shtml':
          responseBody = firstIncludeBody;
          break;
        case '/include2.shtml':
          responseBody = secondIncludeBody;
          break;
        case '/foo/nestedInclude.shtml':
          responseBody = nestedIncludeBody;
          break;
        default:
          throw new Error('Unexpected path: ' + objectPath);
      }
      return Promise.resolve({
        Body: responseBody,
      });
    });
  });

  test('recursively replaces includes with correct body content', async () => {
    const mockCallback = (ignore, data) => {
      const expectedBody = `
  <html>
  <body>
    <div>
      <h1>Navigation or something</h1>
      <span>I go under the nav heading</span>
    </div>

    <div>This is an example.</div>
    <div>a footer</div>
  </body>
  </html>
`;
      const expected = {
        body: expectedBody,
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
      };
      expect(data).toEqual(expected);
      expect(lambdaHandler.getFromS3).toHaveBeenCalledTimes(4);
    };

    await lambdaHandler.handler(testEvent, null, mockCallback);
  });
});
