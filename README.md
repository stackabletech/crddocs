# Stackable CRD docs

Generated with https://github.com/stackabletech/crddocs-generator (have a look there for how it works)

## Building

run `make`, the site is generated in the `site` directory.

## Configuring

configure the repos and versions in the `repo.yaml`.

HTML templates are in the `template` dir, styling in `static`.

## Deployment

The site is deployed at https://crds.stackable.tech with Netlify.

## Development

### Template

The `static/halfmoon-variables.css` file is from the halfmoon UI framework, v1.1.1.
There was a slight modification for navbar alignment.
