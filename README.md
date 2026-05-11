# Stackable CRD docs

https://crds.stackable.tech/

## Building & Running

First run `git submodule update --init` to pull the `crddocs-generator`.

Afterwards run `make`, the site is generated in the `site` directory.
To access the rendered contents use `make serve`.

Generated with https://github.com/stackabletech/crddocs-generator (have a look there for how it works).

## Configuring

Configure the repos and versions in the `repo.yaml`.

HTML templates are in the `template` dir, styling in `static`.

## Deployment

The site is deployed at https://crds.stackable.tech with Netlify.

## Development

### Template

The `static/halfmoon-variables.css` file is from the halfmoon UI framework, v1.1.1.
There was a slight modification for navbar alignment.

### How to add a new platform release

The docs are built for all the repos configured in the `repos.yaml` file. The
list of versions is auto-discovered from GitHub at build time: all calver tags
(`YY.M.P`) on each repo are listed and only the latest patch per `YY.M`
release line is kept (e.g. `24.11.0` is hidden once `24.11.1` exists).
`nightly` (tracking `main`) is always included.

A new SDP release therefore only needs the operator repos to be tagged on
GitHub — no change to `repos.yaml` is required. Trigger the "Trigger Netlify
build hook" GitHub action (or wait for the next build) to pick it up.

To add or remove a repo from the site, edit the flat list in `repos.yaml` and
merge to main.
