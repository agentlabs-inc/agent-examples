import os
from time import sleep

from agentlabs.chat import MessageFormat
from agentlabs.project import Any, IncomingChatMessage, Project
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma

from utils import parse_env_or_raise

class ConversationHistoryManager:
    """Simple in-memory storage for conversation history.
    This is naive, unpersisted and will crash once the context window is full.
    """

    _conversation_id_to_chat_history: dict[str, list[Any]] = {}

    def get_history(self, conversation_id: str) -> list[Any]:
        if conversation_id not in self._conversation_id_to_chat_history:
            self._conversation_id_to_chat_history[conversation_id] = []

        return self._conversation_id_to_chat_history[conversation_id]

conversation_history_manager = ConversationHistoryManager()

def handle_chat_message(message: IncomingChatMessage):
    print(f'INCOMING >> "{message.text}"')

 
    history = conversation_history_manager.get_history(message.conversation_id)

    res = qa_chain({
        'question': message.text,
        'chat_history': history,
    })

    history.append(
        (message.text, res['answer'])
    )

    answer = res['answer']

    # We simulate a streaming effect as streaming the answer only
    # with this chain is a bit tricky. 
    # TODO: improve as this is wasteful.
    stream = ferris.create_stream(
        conversation_id=message.conversation_id,
        format=MessageFormat.MARKDOWN
    )

    parts = [answer[i:i+4] for i in range(0, len(answer), 4)]

    for part in parts:
        stream.write(part)
        sleep(0.01)

    stream.end()

if __name__ == '__main__':
    env = parse_env_or_raise()

    is_vectordb_generated = os.path.exists('./vectordb')

    if not is_vectordb_generated:
        raise Exception('Please run "make setup" before.')

    vectordb = Chroma(persist_directory='./vectordb', embedding_function=OpenAIEmbeddings())

    chatgpt = ChatOpenAI()

    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=chatgpt,
        retriever=vectordb.as_retriever(search_kwargs={'k': 6}),
        return_source_documents=True,
    )

    agentlabs = Project(
            project_id=env.project_id,
            agentlabs_url=env.agentlabs_url,
            secret=env.secret
    )

    ferris = agentlabs.agent(env.agent_id)

    agentlabs.on_chat_message(handle_chat_message)
    agentlabs.connect()
    agentlabs.wait()
    
