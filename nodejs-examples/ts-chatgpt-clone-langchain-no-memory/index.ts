import 'dotenv/config';
import { Project } from "@agentlabs/node-sdk";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {HumanMessage} from "langchain/schema";

const projectId = process.env.AGENTLABS_PROJECT_ID;
const secret = process.env.AGENTLABS_SECRET;
const agentId = process.env.AGENTLABS_AGENT_ID;
const agentlabsUrl = process.env.AGENTLABS_URL;
const openaiApiKey = process.env.OPENAI_API_KEY;

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

const project = new Project({
    projectId,
    secret,
    url: agentlabsUrl,
});

const agent = project.agent(agentId);
project.onChatMessage(async (userMessage) => {
    const conversationId = userMessage.conversationId;

    const chat = new ChatOpenAI({
        streaming: true,
    });

    const stream = agent.createStream({ conversationId }, {
        format: 'Markdown',
    });

    await chat.call([new HumanMessage(userMessage.text)], {
        callbacks: [
            {
                handleLLMNewToken(token: string) {
                    stream.write(token);
                },
            },
        ],
    });
    stream.end();
});

project.connect();
