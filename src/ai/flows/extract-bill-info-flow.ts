
'use server';
/**
 * @fileOverview An AI flow to extract structured information from a bill/invoice image.
 *
 * - extractBillInfo - A function that takes a bill image and returns structured data.
 * - ExtractBillInfoInput - The input type for the extractBillInfo function.
 * - ExtractBillInfoOutput - The return type for the extractBillInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Supplier } from '@/types';
import {find} from 'linkifyjs';

// Helper to find the best match for a supplier name
function findBestSupplierMatch(extractedName: string, suppliers: Supplier[]): string | undefined {
    if (!extractedName || suppliers.length === 0) {
        return undefined;
    }

    let bestMatch: Supplier | undefined = undefined;
    let highestScore = 0;
    const extractedLower = extractedName.toLowerCase();

    for (const supplier of suppliers) {
        const supplierLower = supplier.name.toLowerCase();
        let score = 0;
        if (supplierLower === extractedLower) {
            return supplier.id; // Perfect match
        }
        
        // A simple scoring mechanism
        const words = extractedLower.split(/\s+/);
        for(const word of words) {
            if(supplierLower.includes(word)) {
                score += word.length;
            }
        }
        
        if (score > highestScore) {
            highestScore = score;
            bestMatch = supplier;
        }
    }

    return bestMatch?.id;
}


const ExtractBillInfoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "An image of a bill or invoice, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  suppliers: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).describe("A list of existing suppliers to match against.")
});
export type ExtractBillInfoInput = z.infer<typeof ExtractBillInfoInputSchema>;

const ExtractBillInfoOutputSchema = z.object({
  supplierName: z.string().optional().describe('The name of the supplier or vendor found on the bill.'),
  supplierId: z.string().optional().describe('The ID of the best matching supplier from the provided list.'),
  billNumber: z.string().optional().describe('The bill or invoice number.'),
  date: z.string().optional().describe('The date of the bill in YYYY-MM-DD format.'),
  items: z.array(z.object({
    name: z.string().describe('The name of the purchased item.'),
    quantity: z.number().describe('The quantity of the item.'),
    cost: z.number().describe('The cost or rate per unit of the item.'),
  })).optional().describe('A list of itemized purchases from the bill.'),
  totalAmount: z.number().optional().describe('The final total amount of the bill.'),
});
export type ExtractBillInfoOutput = z.infer<typeof ExtractBillInfoOutputSchema>;

export async function extractBillInfo(input: ExtractBillInfoInput): Promise<ExtractBillInfoOutput> {
    return extractBillInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractBillInfoPrompt',
  input: {
      schema: z.object({ photoDataUri: ExtractBillInfoInputSchema.shape.photoDataUri }),
  },
  output: { schema: ExtractBillInfoOutputSchema },
  prompt: `You are an expert bookkeeper specializing in data extraction from invoices and bills. Analyze the provided image of a bill and extract the following information in a structured JSON format.

Prioritize finding the invoice number, date, and total amount. For items, extract the name, quantity, and unit price/cost.

Rules:
- If a date is found, format it as YYYY-MM-DD.
- If you cannot find a piece of information, omit the field.
- Do not make up information. Only extract what is present on the bill.
- For items, if quantity or price is not clear, try to infer it, but prioritize accuracy. Assume quantity is 1 if not specified.

Image of the bill to analyze: {{media url=photoDataUri}}`,
});

const extractBillInfoFlow = ai.defineFlow(
  {
    name: 'extractBillInfoFlow',
    inputSchema: ExtractBillInfoInputSchema,
    outputSchema: ExtractBillInfoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({ photoDataUri: input.photoDataUri });

    if (!output) {
      throw new Error("AI failed to extract any information from the bill.");
    }
    
    let matchedSupplierId: string | undefined = undefined;
    if (output.supplierName) {
        matchedSupplierId = findBestSupplierMatch(output.supplierName, input.suppliers);
    }
    
    return {
        ...output,
        supplierId: matchedSupplierId
    };
  }
);
