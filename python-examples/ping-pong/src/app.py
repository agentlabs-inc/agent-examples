from typing import Any, Dict, List
from dotenv import load_dotenv
import os
from agentlabs.project import Project, IncomingChatMessage
from pydantic.v1.dataclasses import dataclass



@dataclass()
class ParsedEnv:
    project_id: str
    agentlabs_url: str
    secret: str
    agent_id: str

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
    if message.text == "ping":
        agent.send(
            conversation_id=message.conversation_id,
            text="pong",
        )
    else:
        agent.send(
            conversation_id=message.conversation_id,
            text="I don't understand.",
        )

if __name__ == "__main__":
    env = parse_env_or_raise()
    project = Project(
            project_id=env.project_id,
            agentlabs_url=env.agentlabs_url,
            secret=env.secret,
    )

    agent = project.agent(id=env.agent_id)
    project.on_chat_message(handle_task)

    project.connect()
    project.wait()
