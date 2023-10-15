run: rust-book
	python chat_with_rust_book/app.py

setup: rust-book

rust-book:
	git clone https://github.com/rust-lang/book.git rust-book
	rm -rf ./vectordb
	python chat_with_rust_book/book.py
