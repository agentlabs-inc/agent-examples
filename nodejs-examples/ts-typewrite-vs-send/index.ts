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

const veryLongText = `Ladies and gentlemen, today I want to talk to you about the fascinating concept of speed in communication, and how it can be paradoxically achieved even in the midst of a 1000-character long message. In this age of information overload and rapid digital exchanges, it's crucial to understand that speed doesn't always equate to brevity. So, let's unravel this intriguing phenomenon.

Firstly, we must acknowledge that the speed of communication is not solely determined by the length of a message. It's about how quickly we can convey a message's essence and significance to the recipient. In this 1000-character message, every word is carefully chosen to maximize its informational content and relevance. Each sentence carries meaning, ensuring that no space is wasted. Thus, despite its length, this message is designed to convey a substantial amount of information swiftly.

Moreover, speed is also influenced by the efficiency of transmission and reception. In today's interconnected world, our ability to transmit and receive information has never been faster. High-speed internet, advanced data networks, and cutting-edge devices enable us to process and comprehend messages at an unprecedented pace. This means that even a 1000-character message can be consumed and understood in mere seconds, making it deceptively fast.

Furthermore, the message's organization plays a pivotal role in its perceived speed. By employing concise and coherent paragraphs, headings, and bullet points, the message facilitates rapid comprehension. It guides the reader's eye effortlessly, allowing them to extract key information swiftly without getting lost in a sea of text.

Additionally, the use of clear language and avoidance of unnecessary jargon or verbosity accelerates the message's speed. Clarity eliminates the need for re-reading or deciphering complex phrases, ensuring that the reader can grasp the content expeditiously.

In this digital age, speed is not solely a matter of brevity, but a result of careful crafting, efficient transmission, and reader-friendly formatting. Therefore, even a 1000-character message can be remarkably fast in delivering its intended message, especially when every character is dedicated to conveying essential information concisely and effectively.

In conclusion, we live in an era where the speed of communication has transcended the constraints of length. This 1000-character message, despite its apparent length, exemplifies how a well-structured, informative, and efficiently conveyed message can be incredibly fast in today's fast-paced world. So, remember, it's not always about brevity; it's about clarity, relevance, and effective communication that truly defines speed in our digital age.`

const project = new Project({
    projectId,
    secret,
    url: agentlabsUrl,
});

const agent = project.agent(agentId);

project.onChatMessage(async (message) => {
    await agent.typewrite({
        conversationId: message.conversationId,
        text: "This message has been sent using agent.typewrite() method. It's more fun."
    });

    await agent.typewrite({
        conversationId: message.conversationId,
        text: "This message has been sent using agent.typewrite() method with an upfront delay. It's even more fun."
    }, {
        initialDelayMs: 5000,
    });

    await agent.typewrite({
        conversationId: message.conversationId,
        text: veryLongText,
    }, {
        intervalMs: 10,
        initialDelayMs: 10000,
    });
});

project.connect();