import 'dotenv/config';
import { Project } from "@agentlabs/node-sdk";

const projectId = process.env.AGENTLABS_PROJECT_ID;
const secret = process.env.AGENTLABS_SECRET;
const agentlabsUrl = process.env.AGENTLABS_URL;
const managerAgentId = process.env.MANAGER_AGENT_ID;
const plannerAgentId = process.env.PLANNER_AGENT_ID;
const copywriterAgentId = process.env.COPYWRITER_AGENT_ID;

if (!projectId) {
    throw new Error('Missing AGENTLABS_PROJECT_ID');
}
if (!secret) {
    throw new Error('Missing AGENTLABS_SECRET');
}
if (!managerAgentId || !copywriterAgentId || !plannerAgentId) {
    throw new Error('Missing agent ids');
}
if (!agentlabsUrl) {
    throw new Error('Missing AGENTLABS_URL');
}

const project = new Project({
    projectId,
    secret,
    url: agentlabsUrl,
});

const manager = project.agent(managerAgentId);
const planner = project.agent(plannerAgentId);
const copywriter = project.agent(copywriterAgentId);

project.onChatMessage(async (message) => {
    await manager.typewrite({
        conversationId: message.conversationId,
        text: "Ok, I will assign the task to the planner and copywriter."
    });

    await Promise.all([
        planner.typewrite({
            conversationId: message.conversationId,
            text: "Planner there! I'm making the schedule now...",
        }),
        copywriter.typewrite({
            conversationId: message.conversationId,
            text: "Copywriter there! Waiting for the schedule...",
        }),
    ]);

    await planner.typewrite({
        conversationId: message.conversationId,
        text: "Schedule is ready!"
    }, {
        initialDelayMs: 5000,
    }).then(async () => {
        await copywriter.typewrite({
            conversationId: message.conversationId,
            text: "Ok, I'm writing the posts now.",
        });

        await copywriter.typewrite({
            conversationId: message.conversationId,
            text: "I am done with the posts. Manager, please review them.",
        }, {
            initialDelayMs: 5000,
        })
    });
});

project.connect();