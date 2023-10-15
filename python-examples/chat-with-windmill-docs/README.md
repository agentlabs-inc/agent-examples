# Chat with rust book

A langchain powered agent that answers question about the [official rust book](https://doc.rust-lang.org/book/).

## Getting started

First, make sure you copied the environment from .env.example and filled the required values appropriately.
If you don't have created an AgentLabs project yet, you are invited to do son the [cloud edition](https://console.agentlabs.dev).

```
po install
po shell
make
```

The last `make` command will clone the `rust-book` official repository and generate documents and store them in a local vector database for further use.

It will then initiate a connection to AgentLabs, making the agent actually chattable from its chat UI.
