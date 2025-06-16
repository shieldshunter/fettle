// src/constants/jb2Tools.ts  –  AUTO-generated wrapper
import { JOBBOSS_PARTS_FUNCTIONS } from "./jb2Functions";
import { ChatCompletionCreateParams } from "openai/resources/chat/completions";

// convert [{name,description,…}, …]  →  [{type:"function",function:{…}}, …]
export const JB2_TOOLS: ChatCompletionCreateParams["tools"] =
  JOBBOSS_PARTS_FUNCTIONS.map((f) => ({
    type: "function" as const,
    function: f,
  }));