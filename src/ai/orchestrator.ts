// /ai/orchestrator.ts
import OpenAI from 'openai';

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  // add other environment variables as needed
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {} // just so TS doesn't complain

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const MODEL_NAME = 'o3-mini';
// This interface now includes an array of "functions" describing what
// needs to be generated. Each function is basically a small spec
// the submodel can fill in with code. 
interface ProjectFileSpec {
  filePath: string;
  description: string;       // Overall file-level description
  functions?: Array<FileFunctionSpec>; // Now we store function specs here
}

interface FileFunctionSpec {
  name: string;
  description: string;
  inputs: Array<{ name: string; type: string }>;
  outputs: Array<{ name: string; type: string }>;
  // Optionally: placeholders for advanced details like error-handling strategy, logging, etc.
}


/**
 * The existing entrypoint you call from cluster-page.ts
 * We will keep the same signature so your UI code doesn't break.
 */
export async function generateProjectWithCallbacks(
  userPrompt: string,
  onStepStart: (stepId: string, msg: string) => void,
  onStepFinish: (stepId: string, msg: string) => void,
  vectorStoreId?: string,
  useAdvanced: boolean = false,
  useValidation: boolean = false
): Promise<Record<string, string>> {
  let extraContext = '';

  // 0) Optionally do your vector store search
  if (vectorStoreId) {
    const stepId = 'fileSearch';
    onStepStart(stepId, `[FileSearch] Searching in "${vectorStoreId}" for context...`);
    try {
      const resp = await openai.responses.create({
        model: 'gpt-3.5-turbo', // or something you have access to
        input: `Summarize any relevant info about: ${userPrompt}`,
        tools: [
          {
            type: 'file_search',
            vector_store_ids: [vectorStoreId],
          },
        ],
      });
      onStepFinish(stepId, `[FileSearch] Done searching in "${vectorStoreId}".`);
      extraContext = resp.output_text || '';
    } catch (err) {
      onStepFinish(stepId, `[FileSearch] Failed: ${String(err)}`);
    }
  }

  // Step A: Plan the entire project (files + functions).
  const planStepId = 'planProject';
  onStepStart(planStepId, '[planProject] Requesting structured plan...');
  const plan: ProjectFileSpec[] = await planProject(userPrompt, extraContext, useAdvanced);
  onStepFinish(planStepId, '[planProject] Plan generated & parsed.');

  // Step B: For each file, generate its code in a more procedural way
  const generatedFiles: Record<string, string> = {};

  for (const fileSpec of plan) {
    const stepId = `generateFile:${fileSpec.filePath}`;
    onStepStart(stepId, `[Orchestrator] Generating file "${fileSpec.filePath}"...`);

    const functionBlocks: string[] = await generateFunctionsInFile(fileSpec, extraContext);
    const fileContent = await mergeFunctionsIntoFile(fileSpec, functionBlocks);

    onStepFinish(stepId, `[Orchestrator] Finished "${fileSpec.filePath}".`);
    generatedFiles[fileSpec.filePath] = fileContent;
  }

  // Step C: If 'useValidation' is true => do the 4-pass process
  if (useValidation) {
    const mpvId = 'multiPassValidation';
    onStepStart(mpvId, '[Validation] Starting multi-pass fix process...');
    const finalFiles = await multiPassValidation(
      generatedFiles,
      (stepId, msg) => onStepStart(stepId, msg),
      (stepId, msg) => onStepFinish(stepId, msg)
    );
    onStepFinish(mpvId, '[Validation] Multi-pass fix complete.');
    return finalFiles;
  } else {
    // Return as-is if no validation
    return generatedFiles;
  }
}

/**
 * Step A: Plan the project
 * We now want not only "filePath + description", but also
 * an array of function specs for each file.
 */
async function planProject(
  userPrompt: string,
  extraContext: string,
  useAdvanced: boolean = false
): Promise<ProjectFileSpec[]> {
  // We'll keep your "advanced" or "simple" flow as before,
  // but we'll ask the model for a more "function-level" plan.
  
  if (useAdvanced) {
    // For example, we might ask "o1" to produce super-detailed breakdown:
    const advancedPrompt = `
      The user wants: ${userPrompt}
      Additional context:
      ${extraContext}

      Act as a project manager. Return a JSON array of "ProjectFileSpec" objects, where:
        - "filePath" is the name of the file
        - "description" is a short summary of that file
        - "functions" is an array of function specs. Each function spec has:
            { 
              "name": string,
              "description": string,
              "inputs": [ { "name": string, "type": string } ],
              "outputs": [ { "name": string, "type": string } ] 
            }

      The user wants to build an end-to-end project that might involve front-end (TS/HTML),
      Azure Python functions, or JS-based functions, etc. Provide function-level details
      so that a smaller GPT model can generate the actual code for each function. 
      
      Return valid JSON only, no extra text.
    `;

    const response = await openai.responses.create({
      model: 'o1',
      input: advancedPrompt,
      reasoning: { effort: 'high' },
    });

    try {
      return JSON.parse(response.output_text || '[]');
    } catch (e) {
      console.warn('[planProject] Advanced plan parse error:', e);
      // Fallback:
      return [];
    }
  } else {
    // If not advanced, we do a simpler approach, maybe with 3o
    const simplePrompt = `
      The user wants: ${userPrompt}
      Additional context:
      ${extraContext}

      Return a JSON array of "ProjectFileSpec":
      [
        {
          "filePath": "someFile",
          "description": "...",
          "functions": [
            {
              "name": "functionOne",
              "description": "desc",
              "inputs": [],
              "outputs": []
            }
          ]
        }
      ]
      Return valid JSON only, no commentary.
    `;

    const response = await openai.responses.create({
      model: 'o3-mini',
      input: simplePrompt,
      reasoning: { effort: 'medium' },
    });

    try {
      return JSON.parse(response.output_text || '[]');
    } catch (e) {
      console.warn('[planProject] Simple plan parse error:', e);
      return [];
    }
  }
}

/**
 * Step B(1): For each file spec, we loop over its function specs
 * and call a small GPT model to produce the *implementation code* for each function.
 */
async function generateFunctionsInFile(
  fileSpec: ProjectFileSpec,
  extraContext: string
): Promise<string[]> {
  if (!fileSpec.functions || fileSpec.functions.length === 0) {
    // If no function specs, no code needed
    return [];
  }

  const functionBlocks: string[] = [];

  for (const fnSpec of fileSpec.functions) {
    // We'll call a smaller model (like 3o, 3.5, etc.) to produce
    // the actual code for this function.
    const code = await generateOneFunction(fileSpec, fnSpec, extraContext);
    functionBlocks.push(code);
  }

  return functionBlocks;
}

/**
 * Step B(2): Use a small model or method to produce *just one* function's code,
 * given the name, inputs, outputs, etc.
 */
async function generateOneFunction(
  fileSpec: ProjectFileSpec,
  fnSpec: FileFunctionSpec,
  extraContext: string
): Promise<string> {
  const functionPrompt = `
    You are a code generator. 
    We have a file: ${fileSpec.filePath}.
    The file's overall role: ${fileSpec.description}
    Now implement the following function:

    Name: ${fnSpec.name}
    Description: ${fnSpec.description}
    Inputs: ${JSON.stringify(fnSpec.inputs)}
    Outputs: ${JSON.stringify(fnSpec.outputs)}

    - Show function signature
    - Include docstrings or inline comments 
    - Return only the function's code (no extra commentary).
    
    Additional context: 
    ${extraContext}
  `;

  const response = await openai.responses.create({
    // Possibly a smaller model than o1
    model: 'o3-mini', 
    input: functionPrompt,
    reasoning: { effort: 'medium' },
  });

  return response.output_text || '';
}

/**
 * Step B(3): Once we have an array of function blocks, we glue them into a single file.
 * This is also a great place to add imports, define exports, etc.
 */
async function mergeFunctionsIntoFile(
  fileSpec: ProjectFileSpec,
  functionBlocks: string[]
): Promise<string> {
  // This can be as fancy or simple as you want. 
  // For example, if it's a Python file, we might put some import statements up top:
  if (fileSpec.filePath.endsWith('.py')) {
    return `
"""
File: ${fileSpec.filePath}
Description: ${fileSpec.description}
"""

# Example of your imports:
import logging
import azure.functions as func

${functionBlocks.join('\n\n')}
`;
  }

  // If it’s TS/JS, maybe do something else:
  if (fileSpec.filePath.endsWith('.ts') || fileSpec.filePath.endsWith('.js')) {
    return `
// File: ${fileSpec.filePath}
// Description: ${fileSpec.description}

${functionBlocks.join('\n\n')}
`;
  }

  // Otherwise, just join them as is
  return functionBlocks.join('\n\n');
}

/**
 * (Optional) Step C: Validate all final files as before
 */
async function fixSingleFile(
  filePath: string, 
  content: string
): Promise<string> {
  // Prompt GPT about this single file
  const prompt = `
    You are a code reviewer focusing on a single file at a time. Here is the file:
    FILE PATH: ${filePath}
    CONTENT:
    ${content}

    If you see major errors, missing references, or poor usage of code components,
    or if there's style or best-practice improvement, return:
    {
      "valid": false,
      "fix": "the entire updated file content"
    }
    Otherwise return:
    {
      "valid": true
    }

    Return only valid JSON, with no extra commentary.
  `;

  let response;
  try {
    response = await openai.responses.create({
      model: MODEL_NAME,
      input: prompt,
      reasoning: { effort: 'low' },
    });
  } catch (err) {
    console.warn('[fixSingleFile] Model call failed for file:', filePath, err);
    return content; // Keep original if error
  }

  let parsed;
  try {
    parsed = JSON.parse(response.output_text || '');
  } catch (err) {
    console.warn('[fixSingleFile] JSON parse error for file:', filePath, err);
    return content;
  }

  // If GPT says "valid": false, use the "fix" field
  if (parsed.valid === false && typeof parsed.fix === 'string') {
    return parsed.fix;
  }

  // Otherwise, return original
  return content;
}

/**
 * fixAllFilesTogether: Looks at all files at once to find cross-file or global issues.
 * If the model returns multiple fixes in the format:
 * {
 *   "valid": false,
 *   "fixes": { "someFile": "new content", ... }
 * }
 * we apply them. Otherwise we keep the original.
 */
async function fixAllFilesTogether(files: Record<string, string>): Promise<Record<string, string>> {
  // Combine them into one big string
  const combinedContent = Object.entries(files)
    .map(([path, c]) => `FILE PATH: ${path}\nCONTENT:\n${c}`)
    .join('\n\n---\n\n');

  const prompt = `
    You are a code reviewer focusing on the entire project at once. Below are all the files:
    ${combinedContent}

    If you see cross-file errors or best-practice improvements requiring multi-file changes,
    return a JSON:
    {
      "valid": false,
      "fixes": {
        "<filePath>": "new content",
        ...
      }
    }
    Otherwise return:
    {
      "valid": true
    }

    Return only valid JSON, no extra commentary.
  `;

  let response;
  try {
    response = await openai.responses.create({
      model: MODEL_NAME,
      input: prompt,
      reasoning: { effort: 'low' },
    });
  } catch (err) {
    console.warn('[fixAllFilesTogether] Model call failed.', err);
    return files; 
  }

  let parsed;
  try {
    parsed = JSON.parse(response.output_text || '');
  } catch (err) {
    console.warn('[fixAllFilesTogether] JSON parse error.', err);
    return files; 
  }

  // If "valid": false => apply the fixes
  if (parsed.valid === false && parsed.fixes) {
    for (const [path, newContent] of Object.entries(parsed.fixes)) {
      if (typeof newContent === 'string') {
        files[path] = newContent;
      }
    }
  }

  return files;
}

/**
 * multiPassValidation: Takes generated files and runs the four passes:
 * 1) Per-file (individual) fixes
 * 2) Global fix pass
 * 3) Per-file pass again
 * 4) Final global fix pass
 */
async function multiPassValidation(
  files: Record<string, string>,
  onStepStart?: (stepId: string, msg: string) => void,
  onStepFinish?: (stepId: string, msg: string) => void
): Promise<Record<string, string>> {

  // PASS 1: Individual
  onStepStart?.('pass1', '[Validation] Pass 1: Individual fixes...');
  for (const filePath of Object.keys(files)) {
    files[filePath] = await fixSingleFile(filePath, files[filePath]);
  }
  onStepFinish?.('pass1', '[Validation] Pass 1 complete.');

  // PASS 2: Global
  onStepStart?.('pass2', '[Validation] Pass 2: Global fix...');
  files = await fixAllFilesTogether(files);
  onStepFinish?.('pass2', '[Validation] Pass 2 complete.');

  // PASS 3: Individual again
  onStepStart?.('pass3', '[Validation] Pass 3: Another individual pass...');
  for (const filePath of Object.keys(files)) {
    files[filePath] = await fixSingleFile(filePath, files[filePath]);
  }
  onStepFinish?.('pass3', '[Validation] Pass 3 complete.');

  // PASS 4: Final global fix
  onStepStart?.('pass4', '[Validation] Pass 4: Final global pass...');
  files = await fixAllFilesTogether(files);
  onStepFinish?.('pass4', '[Validation] Pass 4 complete.');

  return files;
}
