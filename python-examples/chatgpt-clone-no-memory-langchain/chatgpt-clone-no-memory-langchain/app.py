from typing import Any, Dict, List
from agentlabs.agent import Agent
from dotenv import load_dotenv
import os
from agentlabs.chat import IncomingChatMessage, MessageFormat
from langchain.callbacks.base import BaseCallbackHandler
from langchain.chat_models import ChatOpenAI
from agentlabs.project import Project
from langchain.schema.messages import BaseMessage, HumanMessage, SystemMessage
from langchain.schema.output import LLMResult
from pydantic.v1.dataclasses import dataclass

@dataclass()
class ParsedEnv:
    project_id: str
    agentlabs_url: str
    secret: str
    agent_id: str

class AgentLabsStreamingCallback(BaseCallbackHandler):
    def __init__(self, agent: Agent, conversation_id: str):
        super().__init__()
        self.agent = agent
        self.conversation_id = conversation_id

    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> Any:
        self.stream = self.agent.create_stream(format=MessageFormat.MARKDOWN, conversation_id=self.conversation_id)

    def on_llm_new_token(self, token: str, **kwargs: Any) -> Any:
        self.stream.write(token)

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> Any:
        self.stream.end();

def parse_env_or_raise():
    load_dotenv()

    project_id = os.environ.get('AGENTLABS_PROJECT_ID')
    if not project_id:
        raise Exception("AGENTLABS_PROJECT_ID is not set")

    agentlabs_url = os.environ.get('AGENTLABS_URL')
    if not agentlabs_url:
        raise Exception("AGENTLABS_URL is not set")

    secret = os.environ.get('AGENTLABS_SECRET')
    if not secret:
        raise Exception("AGENTLABS_SECRET is not set")

    agent_id = os.environ.get('AGENTLABS_AGENT_ID')
    if not agent_id:
        raise Exception("AGENTLABS_AGENT_ID is not set")

    return ParsedEnv(
            project_id=project_id,
            agentlabs_url=agentlabs_url,
            secret=secret,
            agent_id=agent_id,
    )

def handle_task(message: IncomingChatMessage):
    print(f"Handling message: {message.text} sent by {message.member_id}")
    messages: List[BaseMessage] = [
            SystemMessage(content="You are a general assistant designed to help people with their daily tasks. You should format your answers in markdown format as you see fit."),
            HumanMessage(content=message.text)
    ]
    callback = AgentLabsStreamingCallback(agent=agent, conversation_id=message.conversation_id)
    llm(messages, callbacks=[callback])

if __name__ == "__main__":
    env = parse_env_or_raise()
    project = Project(
            project_id=env.project_id,
            agentlabs_url=env.agentlabs_url,
            secret=env.secret,
    )

    llm = ChatOpenAI(streaming=True)

    agent = project.agent(id=env.agent_id)
    project.on_chat_message(handle_task)

    project.connect()
    project.wait()
