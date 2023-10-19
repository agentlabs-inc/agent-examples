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
    manager_agent_id: str
    copywriter_agent_id: str
    planner_agent_id: str

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

    copywriter_agent_id = os.environ.get('COPYWRITER_AGENT_ID')
    if not copywriter_agent_id:
        raise Exception("COPYWRITER_AGENT_ID is not set")

    planner_agent_id = os.environ.get('PLANNER_AGENT_ID')
    if not planner_agent_id:
        raise Exception("PLANNER_AGENT_ID is not set")

    manager_agent_id = os.environ.get('MANAGER_AGENT_ID')
    if not manager_agent_id:
        raise Exception("MANAGER_AGENT_ID is not set")

    return ParsedEnv(
            project_id=project_id,
            agentlabs_url=agentlabs_url,
            secret=secret,
            manager_agent_id=manager_agent_id,
            copywriter_agent_id=copywriter_agent_id,
            planner_agent_id=planner_agent_id,
    )

def handle_task(message: IncomingChatMessage):
    manager.typewrite(
        conversation_id=message.conversation_id,
        text="Ok I will ask my agents to handle this.",
    )

    planner.typewrite(
        conversation_id=message.conversation_id,
        text="I will plan the work for you."
    )
    copywriter.typewrite(
        conversation_id=message.conversation_id,
        text="I will write the copy for you.",
        initial_delay_ms=3000
    )

if __name__ == "__main__":
    env = parse_env_or_raise()
    project = Project(
            project_id=env.project_id,
            agentlabs_url=env.agentlabs_url,
            secret=env.secret,
    )

    manager = project.agent(id=env.manager_agent_id)
    copywriter = project.agent(id=env.copywriter_agent_id)
    planner = project.agent(id=env.planner_agent_id)

    project.on_chat_message(handle_task)

    project.connect()
    project.wait()
