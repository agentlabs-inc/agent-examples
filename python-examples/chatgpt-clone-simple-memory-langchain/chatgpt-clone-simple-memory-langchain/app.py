from typing import Any, Dict, List
from dotenv import load_dotenv
from agentlabs.agent import IncomingChatMessage, MessageFormat, os
from langchain.callbacks.base import BaseCallbackHandler
from langchain.memory import ChatMessageHistory
from langchain.chat_models import ChatOpenAI
from agentlabs.project import Project
from langchain.schema.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain.schema.output import LLMResult
from pydantic.v1.dataclasses import dataclass

@dataclass()
class ParsedEnv:
    project_id: str
    agentlabs_url: str
    secret: str
    agent_id: str

class AgentLabsStreamingCallback(BaseCallbackHandler):
    def __init__(self, message: IncomingChatMessage):
        super().__init__()
        self.message = message

    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> Any:
        self.stream = self.message.streamed_reply(format=MessageFormat.MARKDOWN)

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

class ConversationMemoryManager:
    _conversation_id_to_memory: Dict[str, ChatMessageHistory] = {}

    def get_memory(self, conversation_id: str) -> ChatMessageHistory:
        if conversation_id not in self._conversation_id_to_memory:
            self._conversation_id_to_memory[conversation_id] = ChatMessageHistory()
        return self._conversation_id_to_memory[conversation_id]

memory_manager = ConversationMemoryManager()

def handle_task(message: IncomingChatMessage):
    print(f"Handling message: {message.text} sent by {message.member_id}")

    memory = memory_manager.get_memory(message.conversation_id)

    if len(memory.messages) == 0:
           memory.add_message(SystemMessage(content="You are a general assistant designed to help people with their daily tasks. You should format your answers in markdown format as you see fit."))

    memory.add_message(HumanMessage(content=message.text))

    callback = AgentLabsStreamingCallback(message)
    output = llm(memory.messages, callbacks=[callback])

    memory.add_message(AIMessage(content=output.content))

if __name__ == "__main__":
    env = parse_env_or_raise()
    agentlabs = Project(
            project_id=env.project_id,
            agentlabs_url=env.agentlabs_url,
            secret=env.secret,
    )

    llm = ChatOpenAI(streaming=True)

    agent = agentlabs.agent(env.agent_id)
    agent.on_chat_message(handle_task)

    agent.connect()
    agent.wait()
