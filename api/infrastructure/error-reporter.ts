import { Sentry } from "../../deps.ts";
import { Environment } from "./environment.ts";

export interface ErrorReporter {
  captureException(exception: Error): void;
  captureMessage(message: string): void;
  setScopeTag(tag: string, value: string): void;
  removeScopeTag(tag: string): void;
  stopEvents(): boolean;
}

export class SentryErrorReporter implements ErrorReporter {
  private SENTRY_SAMPLE_RATE = 0.5;
  private SENTRY_DSN =
    "https://510d13bb29e849568634a09f5f612234@o1364222.ingest.sentry.io/4504697605652480";

  private static instance: SentryErrorReporter | null = null;

  public static getInstance() {
    if (SentryErrorReporter.instance === null) {
      SentryErrorReporter.instance = new SentryErrorReporter();
    }

    return SentryErrorReporter.instance;
  }

  private constructor() {
    Sentry.init({
      dsn: this.SENTRY_DSN,
      tracesSampleRate: this.SENTRY_SAMPLE_RATE,
      release: "1.6.0",
      beforeSend: (event: Sentry.Event, _hint?: Sentry.EventHint) => {
        // Do not send the event to Sentry if the app is not in production
        return this.stopEvents() ? null : event;
      },
    });
  }

  captureException(exception: Error) {
    Sentry.captureException(exception);
  }

  captureMessage(message: string) {
    Sentry.captureMessage(message);
  }

  setScopeTag(tag: string, value: string) {
    Sentry.getCurrentScope().setTag(tag, value);
  }

  removeScopeTag(tag: string) {
    Sentry.getCurrentScope().setTag(tag, undefined);
  }

  stopEvents(): boolean {
    return Environment.isDevelopmentMode();
  }
}

export class FakeErrorReporter implements ErrorReporter {
  captureException(_exception: Error) {}
  captureMessage(_message: string) {}
  setScopeTag(_tag: string, _value: string) {}
  removeScopeTag(_tag: string) {}

  stopEvents(): boolean {
    return true;
  }
}
