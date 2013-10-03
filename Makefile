docs: js/*.js
	docco js/*.js

run:

doc: docs
	
handin: *
	tar zcf handin.tar.gz *
