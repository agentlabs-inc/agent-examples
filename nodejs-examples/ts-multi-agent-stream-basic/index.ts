import 'dotenv/config';
import { Project } from "@agentlabs/node-sdk";

const projectId = process.env.AGENTLABS_PROJECT_ID;
const secret = process.env.AGENTLABS_SECRET;
const agentAId = process.env.AGENTLABS_AGENT_A_ID;
const agentBId = process.env.AGENTLABS_AGENT_B_ID;
const agentlabsUrl = process.env.AGENTLABS_URL;

if (!projectId) {
    throw new Error('Missing AGENTLABS_PROJECT_ID');
}
if (!secret) {
    throw new Error('Missing AGENTLABS_SECRET');
}
if (!agentAId || !agentBId) {
    throw new Error('Missing AGENTLABS_AGENT_A_ID or AGENTLABS_AGENT_B_ID');
}
if (!agentlabsUrl) {
    throw new Error('Missing AGENTLABS_URL');
}

const project = new Project({
    projectId,
    secret,
    url: agentlabsUrl,
});

const agentA = project.agent(agentAId);
const agentB = project.agent(agentBId);

project.onChatMessage(async (message) => {
    // We can simulate a delay...
    await new Promise(resolve => setTimeout(resolve, 500));
    const streamA = agentA.createStream({
        conversationId: message.conversationId,
    });
    const streamB = agentB.createStream({
        conversationId: message.conversationId,
    });

    for (const char of 'Hello I am an agent, and I am streaming!'.split('')) {
        await new Promise(resolve => setTimeout(resolve, 100));
        streamA.write(char);
        streamB.write(char);
    }
    streamA.end();
    streamB.end();
});

project.connect();