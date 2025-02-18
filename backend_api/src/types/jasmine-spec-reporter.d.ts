declare module 'jasmine-spec-reporter' {
  interface JasmineStartedInfo {
    totalSpecsDefined: number;
    order: {
      random: boolean;
      seed: string;
      sort: () => number;
    };
  }

  interface Suite {
    id: string;
    description: string;
    fullName: string;
    failedExpectations: Array<{
      message: string;
      stack: string;
      matcherName: string;
    }>;
    status: string;
  }

  interface Spec {
    id: string;
    description: string;
    fullName: string;
    failedExpectations: Array<{
      message: string;
      stack: string;
      matcherName: string;
    }>;
    passedExpectations: Array<{
      message: string;
      stack: string;
      matcherName: string;
    }>;
    pendingReason: string;
    status: string;
    duration: number;
  }

  export class DisplayProcessor {
    displayJasmineStarted(info: JasmineStartedInfo, log: string): string;
    displaySuite(suite: Suite, log: string): string;
    displaySpecStarted(spec: Spec, log: string): string;
    displaySuccessfulSpec(spec: Spec, log: string): string;
    displayFailedSpec(spec: Spec, log: string): string;
    displayPendingSpec(spec: Spec, log: string): string;
  }

  export class SpecReporter {
    constructor(configuration: {
      spec?: {
        displayPending?: boolean;
        displayDuration?: boolean;
      };
      summary?: {
        displayPending?: boolean;
        displayDuration?: boolean;
      };
      customProcessors?: DisplayProcessor[];
    });
  }

  export enum StacktraceOption {
    NONE = 'NONE',
    RAW = 'RAW',
    CLEANED = 'CLEANED',
  }
}
