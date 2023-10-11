import 'dotenv/config';
import { Project } from "@agentlabs/node-sdk";

const projectId = process.env.AGENTLABS_PROJECT_ID;
const secret = process.env.AGENTLABS_SECRET;
const agentId = process.env.AGENTLABS_AGENT_ID;
const agentlabsUrl = process.env.AGENTLABS_URL;

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

const project = new Project({
    projectId,
    secret,
    agentlabsUrl,
});

const agent = project.agent(agentId);

agent.onChatMessage(async (message) => {
    // We can simulate a delay...
    await new Promise(resolve => setTimeout(resolve, 500));

    if (message.text === 'ping') {
        message.reply('pong')
    } else {
        message.reply("Sorry, I didn't get that.")
    }
});

agent.connect()