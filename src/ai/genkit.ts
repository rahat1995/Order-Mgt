import { genkit } from 'genkit';
// import { googleAI } from '@genkit-ai/google-ai';
import { defineDotprompt, dotprompt } from 'genkit/dotprompt';

export const ai = genkit({
  plugins: [
    // googleAI(),
    dotprompt(),
  ],
});
