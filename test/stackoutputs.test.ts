// @ts-ignore
import * as util from 'util'; // eslint-disable-line

const testOutput =
      [
        {
          StackId: 'arn:aws:cloudformation:us-east-1:064156463146:stack/timer-test-stack/f6113a40-2f52-11eb-a0c6-0e65dccd8cb7',
          StackName: 'timer-test-stack',
          ChangeSetId: 'arn:aws:cloudformation:us-east-1:064156463146:changeSet/CDK-ed877ed3-befe-440e-94d7-f15b8e3267da/40bacb3c-3702-4853-8356-b04a1d8e086d',
          Parameters: [],
          CreationTime: '2020-11-25T19:18:13.372Z',
          LastUpdatedTime: '2020-11-25T19:18:19.232Z',
          RollbackConfiguration: {},
          StackStatus: 'CREATE_COMPLETE',
          DisableRollback: false,
          NotificationARNs: [],
          Capabilities: [
            'CAPABILITY_IAM',
            'CAPABILITY_NAMED_IAM',
            'CAPABILITY_AUTO_EXPAND',
          ],
          Outputs: [
            {
              OutputKey: 'testTimerServicetestTimerServiceRestapiEndpoint98B5E19A',
              OutputValue: 'https://no5y7uym65.execute-api.us-east-1.amazonaws.com/prod/',
            },
          ],
          Tags: [],
          EnableTerminationProtection: false,
          DriftInformation: { StackDriftStatus: 'NOT_CHECKED' },
        },
      ];

test('map outputs', async () => {
  console.log(util.inspect(testOutput, false, 5));

  let outputMap = new Map();

  // this mirrors sort of what you get in Javascript with objects
  testOutput[0].Outputs.reduce( (acc, el) => {
    acc.set(el.OutputKey, el.OutputValue);
    return acc;
  }, outputMap);

  console.log(outputMap);
  console.log(outputMap.get('testTimerServicetestTimerServiceRestapiEndpoint98B5E19A'));

  // this is probably more practical since naming of output values can be auto-generated
  const url = testOutput[0].Outputs.find(el => {
    return el.OutputKey.match('RestapiEndpoint');
  }) || { OutputValue: '' };
  console.log(url.OutputValue);
});
