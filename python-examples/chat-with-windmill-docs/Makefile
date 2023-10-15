run: windmilldocs
	python chat_with_windmill_docs/app.py

setup: windmilldocs

windmilldocs:
	git clone https://github.com/windmill-labs/windmilldocs windmilldocs
	rm -rf ./vectordb
	python chat_with_windmill_docs/book.py
