
import { genkit } from 'genkit';
import { googleAI } from 'genkit/googleai';
import { defineDotprompt, dotprompt } from 'genkit/dotprompt';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1', 'v1beta'],
    }),
    dotprompt(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
