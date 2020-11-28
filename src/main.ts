import { App, Construct, Stack, StackProps } from '@aws-cdk/core';
import { ServerlessPeriodicTimer } from 'aws-cdk-serverless-timer';


export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // define resources here...
    /* const testTimerService =*/ new ServerlessPeriodicTimer(this, 'testTimerService');
  }
}

/*
// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};
   */

const app = new App();

new MyStack(app, 'timer-test-stack' /* { env: devEnv } */);
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();
