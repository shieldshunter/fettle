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

export {};

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Use Vite's environment variable
    dangerouslyAllowBrowser: true,
  });

export async function generateProjectWithCallbacks(
  userPrompt: string,
  onStepStart: (stepId: string, msg: string) => void,
  onStepFinish: (stepId: string, msg: string) => void,
  vectorStoreId?: string // optional store id
): Promise<Record<string, string>> {
  let extraContext = '';

  // (Optional) Step 0: File search
  if (vectorStoreId) {
    const stepId = 'fileSearch';
    onStepStart(stepId, `[FileSearch] Searching in "${vectorStoreId}" for context...`);
    try {
      const resp = await openai.responses.create({
        model: 'gpt-4o-mini',
        input: `Summarize any relevant info about: ${userPrompt}`,
        tools: [
          {
            type: 'file_search',
            vector_store_ids: [vectorStoreId],
            // e.g. max_num_results: 3
            // include: ["file_search_call.results"]
          }
        ],
      });
      onStepFinish(stepId, `[FileSearch] Done searching in "${vectorStoreId}".`);

      // We'll store the text from output_text
      extraContext = resp.output_text || '';
    } catch (err) {
      onStepFinish(stepId, `[FileSearch] Failed: ${String(err)}`);
    }
  }

  // Step A: Plan (using extraContext from file search)
  const planStepId = 'planProject';
  onStepStart(planStepId, '[planProject] Requesting project plan...');
  const plan = await planProject(userPrompt, extraContext);
  onStepFinish(planStepId, '[planProject] Plan generated & parsed.');

  // Step B: Generate each file
  const generatedFiles: Record<string, string> = {};
  for (const fileSpec of plan) {
    const stepId = `generateFile:${fileSpec.filePath}`;
    onStepStart(stepId, `[Orchestrator] Generating file "${fileSpec.filePath}"...`);
    // Pass extraContext if you want the search info to shape each file
    const fileContent = await generateOneFile(fileSpec, extraContext);
    onStepFinish(stepId, `[Orchestrator] Finished "${fileSpec.filePath}".`);
    generatedFiles[fileSpec.filePath] = fileContent;
  }

  return generatedFiles;
}

/**
 * The simpler main method called from cluster-page.ts (without callbacks).
 */
export async function generateProject(
    userPrompt: string,
    extraContext: string = '' // <--- new
  ): Promise<Record<string, string>> {
    console.log('[Orchestrator] Starting generateProject with userPrompt:', userPrompt);
  
    // Step A: Plan the project, passing extraContext
    const projectPlan = await planProject(userPrompt, extraContext);
    console.log('[Orchestrator] Project plan received:', projectPlan);
  
    // Step B: Generate each file, passing extraContext
    const generatedFiles: Record<string, string> = {};
    for (const fileSpec of projectPlan) {
      console.log(`[Orchestrator] Generating file "${fileSpec.filePath}"...`);
      const fileContent = await generateOneFile(fileSpec, extraContext);
      generatedFiles[fileSpec.filePath] = fileContent;
      console.log(`[Orchestrator] Finished "${fileSpec.filePath}". Content length: ${fileContent.length}`);
    }
  
    // Step C: Validate
    console.log('[Orchestrator] Validating generated files...');
    const validatedFiles = await validateProject(generatedFiles);
    console.log('[Orchestrator] Validation complete. Returning files.');
  
    return validatedFiles;
  }

/**
 * Step A: Plan the project
 */

async function planProject(
    userPrompt: string,
    extraContext: string
  ): Promise<Array<ProjectFileSpec>> {
    console.log('[planProject] Sending request to openai.responses.create...');
    
    // Combine the user prompt with any extra context
    const combinedPrompt = `
      You are an expert architect.
      The user wants: "${userPrompt}"
  
      Additional reference info (if any):
      ${extraContext}
  
      Please return a JSON array describing each needed file (filePath + short description).
      Keep it minimal if the user asked for a small project, or more thorough if complex.
      If it is an Azure Python function, etc...
    `;
  
    const response = await openai.responses.create({
      model: 'o3-mini',
      input: combinedPrompt,
      reasoning: { effort: 'medium' }
    });
  
    console.log('[planProject] Raw response from OpenAI:', response);
  
    let plan: Array<ProjectFileSpec> = [];
    try {
      const text = response.output_text as string;
      plan = JSON.parse(text);
      console.log('[planProject] Successfully parsed response:', plan);
    } catch (e) {
      console.warn('[planProject] Failed to parse JSON. Using fallback plan. Error:', e);
      plan = [
        { filePath: 'index.html', description: 'Front-end HTML' },
        { filePath: 'index.ts', description: 'Front-end TS logic' },
        { filePath: 'azure-functions/__init__.py', description: 'Azure Function entry point' }
      ];
    }
  
    return plan;
  }
  
  /**
   * Generate one file, optionally incorporating extraContext
   */
  async function generateOneFile(
    fileSpec: ProjectFileSpec,
    extraContext: string
  ): Promise<string> {
    console.log('[generateOneFile] Requesting content for:', fileSpec.filePath);
  
    const combinedPrompt = `
      You are a code generator. 
      The user also provided extra reference info:
      ${extraContext}
  
      Generate the file: "${fileSpec.filePath}" 
      Description: ${fileSpec.description}
      Return ONLY the file content, no extra commentary.
    `;
  
    const response = await openai.responses.create({
      model: 'o3-mini',
      input: combinedPrompt,
      reasoning: { effort: 'high' }
    });
  
    console.log('[generateOneFile] Raw file content from OpenAI:', response);
  
    return (response.output_text || '').trim();
  }
  
  /**
   * Validation step (unchanged)
   */
  async function validateProject(files: Record<string, string>): Promise<Record<string, string>> {
    console.log('[validateProject] Combining files for validation check...');
    const combinedFiles = Object.entries(files)
      .map(([path, content]) => `FILE PATH: ${path}\nCONTENT:\n${content}`)
      .join('\n\n---\n\n');
  
    console.log('[validateProject] Sending validation request to OpenAI...');
    const response = await openai.responses.create({
      model: 'o3-mini',
      input: `
        You are a senior engineer reviewing all files in this project:
        ${combinedFiles}
        If you see major errors, return a JSON like:
        {
          "valid": false,
          "fixes": {
            "filePath": "corrected content"
          }
        }
        Otherwise return {"valid": true}.
      `,
      reasoning: { effort: 'low' }
    });
  
    console.log('[validateProject] Raw validation response from OpenAI:', response);
  
    let validationOutput = response.output_text;
  
    try {
      const parsed = JSON.parse(validationOutput);
      console.log('[validateProject] Parsed validation response:', parsed);
  
      if (parsed.valid === false && parsed.fixes) {
        console.log('[validateProject] Applying fixes:', parsed.fixes);
        for (const [fixPath, fixContent] of Object.entries(parsed.fixes)) {
          files[fixPath] = fixContent as string;
        }
      }
    } catch (err) {
      console.warn('[validateProject] Could not parse validation JSON. Error:', err);
    }
  
    return files;
  }
  
  interface ProjectFileSpec {
    filePath: string;
    description: string;
  }