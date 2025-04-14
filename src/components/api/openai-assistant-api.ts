
/*
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey:  import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' }
});

const ASSISTANT_ID = import.meta.env.VITE_ASSISTANT_ID;



export class  callAssistantAPI(userText: string): Promise<AssistantMsg> {
    let threadId = sessionStorage.getItem('tsrThread');
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      sessionStorage.setItem('tsrThread', threadId);
    }

    await openai.beta.threads.messages.create(threadId, { role: 'user', content: userText });
    const run = await openai.beta.threads.runs.create(threadId, { assistant_id: ASSISTANT_ID });

    while (true) {
      const r = await openai.beta.threads.runs.retrieve(threadId, run.id);
      if (r.status === 'completed') break;
      if (['failed','expired'].includes(r.status)) throw new Error(`Run ${r.status}`);
      await new Promise(r => setTimeout(r, 800));
    }

    const { data } = await openai.beta.threads.messages.list(threadId, { limit: 1 });
    const block = data[0].content[0];
    if (block.type !== 'text') throw new Error('Assistant returned non‑text block');

    const raw = block.text.value;
    let parsed: { raw_text?: string; part_numbers?: string[] } = {};
    try { parsed = JSON.parse(raw); } catch {}

    const partNumbers = Array.isArray(parsed.part_numbers) ? parsed.part_numbers : [];
    await this.prefetchBinLocations(partNumbers); // ✅ move before return

    return {
      role:        'assistant',
      rawText:     parsed.raw_text ?? raw,
      partNumbers: partNumbers
    };
  }
    */