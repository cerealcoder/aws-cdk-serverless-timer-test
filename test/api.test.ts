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
  let resp;
  const subUrl = '/periodic/' + id;
  resp = await req.put(subUrl, '{ "key": "foo", "value": "value" }');
  console.log('---put' + util.inspect(resp, false, 4));
  resp = await req.get(subUrl);
  console.log('---get' + util.inspect(resp, false, 4));
  resp = await req.delete(subUrl);
  console.log('---delete' + util.inspect(resp, false, 4));


  //const destroyResult = await cdkApp.destroy(stackName);
  //console.log(util.inspect(destroyResult, false, 8));

}, 300000);
