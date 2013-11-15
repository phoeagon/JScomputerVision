docs: js/*.js
	docco js/*.js

run:

doc: docs
	
handin: *
	[ -f handin.tar.gz ] && rm handin.tar.gz || echo ""
	tar zcf handin.tar.gz *

deploy:
	sudo rsync -u -r * /var/www/
