export * from './environment-type';
import { Environment } from './environment-type';
export const environment: any = window['webAppConfig'];
// environment?.serviceDomain = 'https://mdl-orchestrator.dev.qd.pwcinternal.com/';
environment?.serviceDomain = 'https://orchestrator.learnbytesting.ai/';
