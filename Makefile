site:
	./crddocs-generator/build-site.sh repos.yaml template static site

serve:
	sleep 1 && xdg-open 'http://localhost:8000' &
	python -m http.server --directory site

clean:
	rm -f crddocs-generator/doc
	rm -f crddocs-generator/gitter
	rm -rf site
