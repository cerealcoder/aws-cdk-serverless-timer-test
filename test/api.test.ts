/**
 * @jest-environment node
 */
import '@aws-cdk/assert/jest';
import { AwsCdkExec } from 'aws-cdk-exec';
// @ts-ignore
import * as util from 'util'; // eslint-disable-line
import * as AWS from 'aws-sdk';
import axios from 'axios';
import * as uuid from 'uuid';


test('deploy, test api, and destroy', async () => {
  const cdkApp = new AwsCdkExec();
  const stackList = (await cdkApp.list()).list;
  console.log(util.inspect(stackList, false, 8));

  const stackName = 'timer-test-stack';
  const apiStackResult = await cdkApp.deploy(stackName);
  console.log(util.inspect(apiStackResult, false, 8));

  const cloudformation = new AWS.CloudFormation();
  const queryparams = {
    StackName: stackName,
  };
  const stack = await cloudformation.describeStacks(queryparams).promise();

  // @see https://stackoverflow.com/questions/26264956/convert-object-array-to-hash-map-indexed-by-an-attribute-value-of-the-objec
  //let stackOutputs = {};
  let url:string|undefined;
  if (stack && stack.Stacks && stack.Stacks[0] && stack.Stacks[0].Outputs) {
    const tmp = stack.Stacks[0].Outputs.find(el => {
      return el && el.OutputKey && el.OutputKey.match('RestapiEndpoint');
    });
    if (tmp) {
      url = tmp.OutputValue;
    }
  }
  expect(url).toBeTruthy();
  console.log(url);

  let req = axios.create({
    baseURL: url,
    timeout: 20000,
  });

  const id = uuid.v4();
  const startTime = Date.now();
  let resp;
  const subUrl = '/periodic/' + id;
  const timerCallbackData = { timerCallbackData: { id: id, startTime: startTime } };
  resp = await req.put(subUrl, JSON.stringify(timerCallbackData) );
  //console.log('---put' + util.inspect(resp.data, false, 4));
  expect(resp.data).toHaveProperty('id');
  expect(resp.data).toHaveProperty('shardId');
  expect(resp.data).toHaveProperty('timeShardId');
  expect(resp.data).toHaveProperty('timerCallbackData');

  resp = await req.get(subUrl);
  //console.log('---get' + util.inspect(resp.data, false, 4));
  expect(resp.data).toHaveProperty('id');
  expect(resp.data).toHaveProperty('shardId');
  expect(resp.data).toHaveProperty('timeShardId');
  expect(resp.data).toHaveProperty('timerCallbackData');
  expect(resp.data.timerCallbackData).toHaveProperty('id');
  expect(resp.data.timerCallbackData).toHaveProperty('startTime');
  expect(resp.data.id).toEqual(id);
  expect(resp.data.timerCallbackData.id).toEqual(id);
  expect(resp.data.timerCallbackData.startTime).toEqual(startTime);


  resp = await req.delete(subUrl);
  //console.log('---delete' + util.inspect(resp.data, false, 4));
  expect(resp.data).toEqual(id);

  // ensure deltion
  try {
    resp = await req.get(subUrl);
    expect(false).toBeTruthy(); // should never get here
  } catch (err) {
    console.log('---get2' + util.inspect(err.response, false, 4));
    expect(err.response.status).toEqual(404);
  }

  //const destroyResult = await cdkApp.destroy(stackName);
  //console.log(util.inspect(destroyResult, false, 8));

}, 300000);
