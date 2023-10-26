import 'dotenv/config';
import {Attachment, Project} from "@agentlabs/node-sdk";
import axios, {Axios} from "axios";
import * as fs from "fs";

const projectId = process.env.AGENTLABS_PROJECT_ID;
const secret = process.env.AGENTLABS_SECRET;
const agentId = process.env.AGENTLABS_AGENT_ID;
const agentlabsUrl = process.env.AGENTLABS_URL;
const dezgoApiKey = process.env.DEZGO_API_KEY;

if (!projectId || !secret || !agentId || !agentlabsUrl || !dezgoApiKey) {
    throw new Error('Missing environment variables');
}

const agentlabs = new Project({
    projectId,
    secret,
    url: agentlabsUrl,
});

const agent = agentlabs.agent(agentId);

const generateImage = async (prompt: string): Promise<{ path: string }> => {
    const response = await axios.post('https://api.dezgo.com/text2image', {
        prompt,
        width: 320,
        height: 320,
        model: 'dreamshaper_8',
    }, {
        responseType: 'arraybuffer',
        headers: {
            'x-dezgo-key': dezgoApiKey,
        },
    });
    // We store our image locally
    const filePath = `/tmp/my-image-${Date.now()}.png`;
    fs.writeFileSync(filePath, response.data);
    return {
        path: filePath,
    }
}

agentlabs.onChatMessage(async (message) => {
    // Here we leverage the Dezgo API to generate 3 images from the user's text prompt
    const [
        image1,
        image2,
        image3,
    ] = await Promise.all([
        generateImage(message.text),
        generateImage(message.text),
        generateImage(message.text),
    ]);

    // We create our Agent Labs Attachments from our local files
    const attachments = [
        Attachment.fromLocalFile(image1.path),
        Attachment.fromLocalFile(image2.path),
        Attachment.fromLocalFile(image3.path),
    ];

    // We send the attachment to the user
    await agent.send({
        conversationId: message.conversationId,
        text: 'Here are your images :)',
        attachments,
    });
});

agentlabs.connect();