const { mockClient } = require('aws-sdk-client-mock')
const {
  CodePipelineClient,
  StartPipelineExecutionCommand,
} = require('../src/node_modules/@aws-sdk/client-codepipeline')
const {
  SSMClient,
  GetParameterCommand,
  GetParametersByPathCommand,
} = require('../src/node_modules/@aws-sdk/client-ssm')
const { handler } = require('../src/index')

process.env.GIT_BRANCH = 'branch-name-abc'
process.env.GIT_REPO = 'ndlib/my-awesome-repository'
process.env.TRIGGER_PARAMS_PATH = '/path/to/triggers'
process.env.WEBHOOK_SECRET = 'abcd1234'

const ssmMock = mockClient(SSMClient)
const codepipelineMock = mockClient(CodePipelineClient)

describe('sourceWatcherLambda handler', () => {
  beforeEach(() => {
    console.log = jest.fn()
    console.warn = jest.fn()
    console.error = jest.fn()

    ssmMock.resolves({})
    ssmMock.on(GetParametersByPathCommand).resolves({
      Parameters: [
        {
          Name: 'path/to/triggers/pipeline-1',
          Value: 'list/of/patterns,example.*',
        },
        {
          Name: 'path/to/triggers/pipeline-2',
          Value: 'file/example.ts',
        },
      ],
    })

    codepipelineMock.resolves({})
  })

  afterEach(() => {
    ssmMock.reset()
    codepipelineMock.reset()
  })

  test('should only execute pipelines with matching file changes found', async () => {
    ssmMock
      .on(GetParameterCommand, {
        Name: '/all/stacks/pipeline-1/pipeline-name',
      })
      .resolves({
        Parameter: {
          Name: '/all/stacks/pipeline-1/pipeline-name',
          Value: 'my-pipeline-ABC1234',
        },
      })
      .on(GetParameterCommand, {
        Name: '/all/stacks/pipeline-2/pipeline-name',
      })
      .resolves({
        Parameter: {
          Name: '/all/stacks/pipeline-2/pipeline-name',
          Value: 'my-other-pipeline-DEF1234',
        },
      })

    const testEvent = createTestEvent()
    const mockCallback = (_, response) => {
      expect(response.statusCode).toEqual(200)
      expect(codepipelineMock.calls()).toHaveLength(1)
      expect(response.body).toEqual(
        JSON.stringify({
          triggered: ['my-other-pipeline-DEF1234'],
          failed: [],
        }),
      )
    }
    await handler(testEvent, null, mockCallback)
  })

  test('should handle multiple batches fetching parameters', async () => {
    ssmMock
      .on(GetParametersByPathCommand, {
        Path: process.env.TRIGGER_PARAMS_PATH,
        MaxResults: 10,
        NextToken: undefined,
        Recursive: true,
      })
      .resolves({
        Parameters: [
          {
            Name: 'path/to/triggers/pipeline-1',
            Value: 'list/of/patterns,example.*',
          },
        ],
        NextToken: 'continue-processing-abc',
      })
      .on(GetParametersByPathCommand, {
        Path: process.env.TRIGGER_PARAMS_PATH,
        MaxResults: 10,
        NextToken: 'continue-processing-abc',
        Recursive: true,
      })
      .resolves({
        Parameters: [
          {
            Name: 'path/to/triggers/pipeline-2',
            Value: 'file/example.ts',
          },
        ],
      })

    const testEvent = createTestEvent()
    const mockCallback = (_, response) => {
      expect(response.statusCode).toEqual(200)
      expect(ssmMock.calls()).toHaveLength(4) // 2 calls to GetParametersByPathCommand, 2 calls to GetParameterCommand
    }
    await handler(testEvent, null, mockCallback)
  })

  test('should handle ping event and return 200', async () => {
    const testEvent = createTestEvent(undefined, undefined, undefined, 'ping', undefined)
    const mockCallback = (_, response) => {
      expect(response.statusCode).toEqual(200)
    }
    await handler(testEvent, null, mockCallback)
  })

  test('should ignore events targetting a different branch and return 204', async () => {
    const testEvent = createTestEvent(
      undefined,
      'refs/heads/differentBranchName',
      '4113e8a0b752e3f02acb7d1d7e227e1c9f335616',
    )
    const mockCallback = (_, response) => {
      expect(response.statusCode).toEqual(204)
    }
    await handler(testEvent, null, mockCallback)
  })

  test('should ignore and return 204 for events with no branch ref', async () => {
    const testEvent = createTestEvent(undefined, 'blah', '7160c7452b674f087fe0f6700fa3701f3873631d')
    const mockCallback = (_, response) => {
      expect(response.statusCode).toEqual(204)
    }
    await handler(testEvent, null, mockCallback)
  })

  describe('errors', () => {
    test('should return 500 if pipeline invoking triggers have mixed results', async () => {
      ssmMock
        .on(GetParametersByPathCommand)
        .resolves({
          Parameters: [
            {
              Name: 'path/to/triggers/pipeline-1',
              Value: 'my/file.js',
            },
            {
              Name: 'path/to/triggers/pipeline-2',
              Value: '/ignore/my/pattern*,**/example.ts',
            },
            {
              Name: 'path/to/triggers/pipeline-3',
              Value: 'IGNORED_COMPLETELY',
            },
          ],
        })
        .on(GetParameterCommand, {
          Name: '/all/stacks/pipeline-1/pipeline-name',
        })
        .resolves({
          Parameter: {
            Name: '/all/stacks/pipeline-1/pipeline-name',
            Value: 'failing-pipeline',
          },
        })
        .on(GetParameterCommand, {
          Name: '/all/stacks/pipeline-2/pipeline-name',
        })
        .resolves({
          Parameter: {
            Name: '/all/stacks/pipeline-2/pipeline-name',
            Value: 'successful-pipeline',
          },
        })
        // Make sure that the absence of a pipeline doesn't cause ALL to fail
        .on(GetParameterCommand, {
          Name: '/all/stacks/pipeline-3/pipeline-name',
        })
        .rejects('No parameter found for pipeline-3 name.')

      codepipelineMock
        .on(StartPipelineExecutionCommand, {
          name: 'failing-pipeline',
        })
        .rejects('Error!')

      const testEvent = createTestEvent()
      const mockCallback = (_, response) => {
        expect(response.statusCode).toEqual(500)
        expect(codepipelineMock.calls()).toHaveLength(2)
        expect(response.body).toEqual(
          JSON.stringify({
            triggered: ['successful-pipeline'],
            failed: ['failing-pipeline'],
          }),
        )
      }
      await handler(testEvent, null, mockCallback)
    })

    const requiredHeaders = ['X-Hub-Signature', 'X-GitHub-Event', 'X-GitHub-Delivery']
    requiredHeaders.forEach(headerName => {
      test(`should return 401 when no ${headerName} header found`, async () => {
        const testEvent = createTestEvent(undefined, undefined, undefined, undefined, [headerName])
        const mockCallback = (_, response) => {
          expect(response.statusCode).toEqual(401)
        }
        await handler(testEvent, null, mockCallback)
      })
    })

    test('should return 401 if encoded payload signature does not match X-Hub-Signature', async () => {
      const testEvent = createTestEvent(undefined, undefined, 'invalid', undefined, undefined)
      const mockCallback = (_, response) => {
        expect(response.statusCode).toEqual(401)
      }
      await handler(testEvent, null, mockCallback)
    })

    test('should return a 500 when no trigger parameters found', async () => {
      ssmMock.on(GetParametersByPathCommand).resolves({})

      const testEvent = createTestEvent()
      const mockCallback = (_, response) => {
        expect(ssmMock.calls()).toHaveLength(1)
        expect(response.statusCode).toEqual(500)
      }
      await handler(testEvent, null, mockCallback)
    })

    test('should return a 500 when failing to fetch parameters', async () => {
      ssmMock.on(GetParametersByPathCommand).rejects('You lose! Good day sir!')

      const testEvent = createTestEvent()
      const mockCallback = (_, response) => {
        expect(ssmMock.calls()).toHaveLength(1)
        expect(response.statusCode).toEqual(500)
        expect(response.body).toEqual('Failed to retrieve pipeline trigger parameter(s).')
      }
      await handler(testEvent, null, mockCallback)
    })

    test('should return a 400 when X-GitHub-Event is invalid', async () => {
      const testEvent = createTestEvent(undefined, undefined, undefined, 'invalid', undefined)
      const mockCallback = (_, response) => {
        expect(response.statusCode).toEqual(400)
      }
      await handler(testEvent, null, mockCallback)
    })
  })
})

const createTestEvent = (repo, ref, signature, eventName, omitHeaders) => {
  const headers = {
    Accept: '*/*',
    'content-type': 'application/json',
    'User-Agent': 'GitHub-Hookshot/4d9ff82',
    'X-GitHub-Delivery': 'fc6ca850-c3a1-11eb-8c47-789d9bd5d183',
    'X-GitHub-Event': eventName || 'push',
    'X-GitHub-Hook-ID': 300346333,
    'X-GitHub-Hook-Installation-Target-ID': 345417923,
    'X-GitHub-Hook-Installation-Target-Type': 'repository',
    'X-Hub-Signature': `sha1=${signature || '3c4681dd900863ea3991e2d9bdf57d4583f593d6'}`,
  }
  // Allows for us to make events that leave out certain headers without copy & pasting a bunch
  if (omitHeaders && omitHeaders.length) {
    omitHeaders.forEach(name => {
      delete headers[name]
    })
  }

  const fullRepo = repo || process.env.GIT_REPO
  const splitRepo = fullRepo.split('/')
  return {
    headers: headers,
    body: JSON.stringify({
      ref: ref || `refs/heads/${process.env.GIT_BRANCH}`,
      repository: {
        name: splitRepo[1],
        full_name: fullRepo,
        owner: {
          name: splitRepo[0],
          login: splitRepo[0],
        },
      },
      commits: [
        {
          added: ['file/example.ts', 'file/not/something/relevant.ts'],
          removed: [],
          modified: ['README.md'],
        },
        {
          added: ['my/file.js'],
          removed: [],
          modified: [],
        },
      ],
    }),
  }
}
