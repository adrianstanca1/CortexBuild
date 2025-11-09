import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : undefined;

const systemPrompt = `You are NewEra CortexBuild Copilot, an expert construction operations assistant.
Use concise, actionable language. If you lack data, state assumptions.`;

export async function generateResponse(input: {
  message: string;
  context: Record<string, unknown>;
}): Promise<string> {
  if (!openai) {
    return `Copilot offline. Provide instructions: "${input.message.substring(0, 120)}"`;
  }

  const completion = await openai.responses.create({
    model: 'gpt-4.1-mini',
    reasoning: { effort: 'medium' },
    input: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: `Message: ${input.message}` },
          { type: 'text', text: `Context: ${JSON.stringify(input.context).slice(0, 2000)}` }
        ]
      }
    ]
  });

  const message = completion.output?.[0] as { type: 'output_text'; text: string } | undefined;
  return message?.text ?? 'Unable to craft response.';
}
