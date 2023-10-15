from dataclasses import dataclass
from dotenv import load_dotenv
import os

@dataclass
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
