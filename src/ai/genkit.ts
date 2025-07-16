import { genkit } from 'genkit';
// import { googleAI } from '@genkit-ai/google-ai';
import { dotprompt } from '@genkit-ai/dotprompt';

export const ai = genkit({
  plugins: [
    // googleAI(),
    dotprompt(),
  ],
});
