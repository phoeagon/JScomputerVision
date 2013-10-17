docs: js/*.js
	docco js/*.js

run:

doc: docs
	
handin: *
	rm handin.tar.gz
	tar zcf handin.tar.gz *

deploy:
	sudo rsync -u -r * /var/www/
