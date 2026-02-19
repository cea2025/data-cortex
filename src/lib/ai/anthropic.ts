import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface SynthesizeParams {
  assetName: string;
  assetType: string;
  knowledgeItems: {
    id: string;
    title: string;
    content: string;
    type: string;
  }[];
}

export async function synthesizeInsight(params: SynthesizeParams): Promise<{
  synthesis: string;
  confidence: number;
  sourceIds: string[];
}> {
  const knowledgeContext = params.knowledgeItems
    .map((ki, i) => `[${i + 1}] (${ki.type}) ${ki.title}: ${ki.content}`)
    .join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `You are a Core Banking data analyst assistant. Analyze the knowledge items about a database asset and provide a concise synthesis in Hebrew. Always reference which knowledge items you based your conclusions on using their numbers [1], [2], etc. Rate your confidence from 0 to 1.`,
    messages: [
      {
        role: "user",
        content: `Asset: ${params.assetName} (${params.assetType})\n\nKnowledge Items:\n${knowledgeContext}\n\nProvide:\n1. A synthesis paragraph in Hebrew\n2. Your confidence score (0-1)\n3. List of source item numbers used\n\nRespond in JSON format: { "synthesis": "...", "confidence": 0.85, "sourceIndices": [1, 2] }`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  
  try {
    const parsed = JSON.parse(text);
    const sourceIds = (parsed.sourceIndices || []).map(
      (idx: number) => params.knowledgeItems[idx - 1]?.id
    ).filter(Boolean);

    return {
      synthesis: parsed.synthesis || text,
      confidence: parsed.confidence || 0.5,
      sourceIds,
    };
  } catch {
    return {
      synthesis: text,
      confidence: 0.5,
      sourceIds: params.knowledgeItems.map((ki) => ki.id),
    };
  }
}
