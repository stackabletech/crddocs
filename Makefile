site:
	./crddocs-generator/build-site.sh repos.yaml template static site

serve:
	python -m http.server --directory site

clean:
	rm crddocs-generator/doc
	rm crddocs-generator/gitter
	rm -r site
