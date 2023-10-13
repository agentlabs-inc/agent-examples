import 'dotenv/config';
import { Project } from "@agentlabs/node-sdk";
import { Session } from '@e2b/sdk'
import OpenAI from 'openai'

const projectId = process.env.AGENTLABS_PROJECT_ID;
const secret = process.env.AGENTLABS_SECRET;
const agentId = process.env.AGENTLABS_AGENT_ID;
const agentlabsUrl = process.env.AGENTLABS_URL;
const openaiApiKey = process.env.OPENAI_API_KEY;
const e2bApiKey = process.env.E2B_API_KEY;

if (!projectId) {
    throw new Error('Missing AGENTLABS_PROJECT_ID');
}
if (!secret) {
    throw new Error('Missing AGENTLABS_SECRET');
}
if (!agentId) {
    throw new Error('Missing AGENTLABS_AGENT_ID');
}
if (!agentlabsUrl) {
    throw new Error('Missing AGENTLABS_URL');
}
if (!openaiApiKey) {
    throw new Error('Missing OPENAI_API_KEY');
}
if (!e2bApiKey) {
    throw new Error('Missing E2B_API_KEY');
}

const project = new Project({
    projectId,
    secret,
    agentlabsUrl,
});

const agent = project.agent(agentId);

const openai = new OpenAI()

const functions = [
    {
        name: 'exec_code',
        description: 'Executes the passed JavaScript code using Nodejs and returns the stdout and stderr',
        parameters: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    description: 'The JavaScript code to execute.',
                },
            },
            required: ['code'],
        },
    },
]

agent.onChatMessage(async (userMessage) => {
    await  new Promise(resolve => setTimeout(resolve, 6000));
    userMessage.reply('Okay, let me think about it...');

    const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                role: 'system',
                content: 'You are a senior developer that can code in JavaScript. Always produce valid JSON.',
            },
            {
                role: 'user',
                content: 'Write hello world',
            },
            {
                role: 'assistant',
                content: '{"code": "print("hello world")"}',
                name: 'exec_code',
            },
            {
                role: 'user',
                content: userMessage.text,
            }
        ],
        functions,
    });

    const message = chatCompletion.choices[0].message;

    const func = message["function_call"];

    if (func) {
        const stream = userMessage.streamedReply({
            format: 'MARKDOWN',
        });

        const funcName = func["name"];

        // Get rid of newlines and leading/trailing spaces in the raw function arguments JSON string.
        // This sometimes help to avoid JSON parsing errors.
        let args = func["arguments"];
        args = args.trim().replace(/\n|\r/g, "");
        // Parse the cleaned up JSON string.
        const funcArgs = JSON.parse(args);

        stream.write(`Here is the code I have to execute:\n`);
        stream.write(`\`\`\`js\n${funcArgs["code"]}\n\`\`\`\n\n`);

        // If the model is calling the exec_code function we defined in the `functions` variable, we want to save the `code` argument to a variable.
        if (funcName === "exec_code") {
            const code = funcArgs["code"];
            const session = await Session.create({
                id: 'Nodejs',
                apiKey: e2bApiKey,
            });

            await session.filesystem.write('/index.js', code);
            stream.write(`Executing the code...\n\n`);

            stream.write(`\`\`\`\n`);

            const proc = await session.process.start({
                cmd: 'node /index.js',
                onStdout: (data) => {
                    stream.write(data.line + '\n');
                },
                onStderr: (data) => {
                    stream.write(data.line + '\n');
                }
            });

            await proc.finished;
            stream.write(`\n\`\`\`\n`);
            stream.write('The code has been executed thanks to e2b.dev\n\n');
        }
        stream.end();
    } else {
        // The model didn't call a function, so we just print the message.
        const content = message["content"];
        userMessage.reply(content ?? 'It seems the model did not responded. Please try again.');
    }
});

agent.connect()
