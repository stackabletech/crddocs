# Stackable CRD docs

https://crds.stackable.tech/

## Building

run `make`, the site is generated in the `site` directory.

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

The docs are built for all the repos and branches configured in the `repos.yaml` file.
so if this file is updated and merged into main, the automated Netlify build will automatically build
new documentation for any changes. Instructions:

- Add the new {major}.{minor}.{patch} version for all `repos` as well as a `platformVersion` to the `repos.yaml` file.
- Merge these changes into main.
- Wait 5 minutes for the Netlify build to update the page. You can also manually run the "Trigger Netlify build hook" GitHub action to trigger a build.
