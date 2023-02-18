import * as Sentry from "npm:@sentry/node";

export class SentryWrapper {
  SENTRY_SAMPLE_RATE = 0.5;
  SENTRY_DSN =
    "https://510d13bb29e849568634a09f5f612234@o1364222.ingest.sentry.io/4504697605652480";

  initSentry() {
    Sentry.init({
      dsn: this.SENTRY_DSN,
      tracesSampleRate: this.SENTRY_SAMPLE_RATE,
      beforeSend: (event: Sentry.Event, _hint?: Sentry.EventHint) => {
        const { DEV_MODE } = Deno.env.toObject();
        const isProduction = DEV_MODE !== "1";

        if (isProduction) {
          return event;
        }
        
        // Do not send the event to Sentry if the app is not in production
        return null;
      },
    });
    Sentry.captureMessage('Hello, world!');
    setTimeout(( ) => {
      try {
        foo()
      } catch (error) {
        Sentry.captureException(error)
      }
    }, 99)
  }
}
