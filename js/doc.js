import React, { useMemo, useState, useEffect, useCallback } from 'react'
import EventEmitter3 from 'eventemitter3'
import ClipboardJS from 'clipboard'
import { render } from 'react-dom'
import DOMPurify from 'dompurify'
import { html } from 'htm/react'
import slugify from 'slugify'
import { marked } from 'marked'

// Syntax highlighting imports
import { createHighlighterCore } from 'shiki/core'
import dracula from 'shiki/themes/dracula.mjs'
import getWasm from 'shiki/wasm'
import yaml from 'shiki/langs/yaml.mjs'

const supportedLangs = ['yaml'];
const bus = new EventEmitter3();
window.bus = bus;

const clipboard = new ClipboardJS('.copy-url');
clipboard.on('success', e => {
    // Get the button that was clicked
    var button = e.trigger;

    // Create the tooltip
    var tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.innerHTML = 'Copied!';
    button.appendChild(tooltip);

    // Show the tooltip
    setTimeout(function() {
      tooltip.classList.add('show');
    }, 50);

    // Hide the tooltip after 2 seconds and remove it
    setTimeout(function() {
      tooltip.classList.remove('show');
      setTimeout(function() {
        tooltip.remove();
      }, 10);
    }, 1500);

    // Clear selection
    e.clearSelection();
});
clipboard.on('error', e => {
  console.error('Copy failed!');
});

const highlighter = await createHighlighterCore({
  loadWasm: getWasm,
  themes: [dracula],
  langs: [yaml],
})

marked.use({
  renderer: {
    code: (code, lang, escaped) => {
      if (lang === undefined || !supportedLangs.includes(lang)) {
        return `<pre><code>${code}</code></pre>`;
      } else {
        const tokenizedCode = highlighter.codeToHtml(code);
        return `<pre class="language-${lang}"><code class="language-${lang}">${tokenizedCode}</code></pre>`;
      }
    }
  }
})

const { Kind, Group, Version, Schema } = JSON.parse(document.getElementById('pageData').textContent);

const properties = Schema.Properties;
if (properties?.apiVersion) delete properties.apiVersion;
if (properties?.kind) delete properties.kind;
if (properties?.metadata?.Type == "object") delete properties.metadata;

function getDescription(schema) {
  let desc = schema.Description || '';
  if (desc.trim() == '') {
    desc = '_No Description Provided._'
  }
  return DOMPurify.sanitize(marked.parse(desc));
}

function CRD() {
  const expandAll = useCallback(() => bus.emit('expand-all'), []);
  const collapseAll = useCallback(() => bus.emit('collapse-all'), []);

  // this used to go under the codeblock, but our descriptions are a bit useless at the moment
  // <p class="font-size-18">${React.createElement('div', { dangerouslySetInnerHTML: { __html: getDescription(Schema) } })}</p>

  const gvkCode = `apiVersion: ${Group}/${Version}\nkind: ${Kind}`;
  const gvkTokens = highlighter.codeToHtml(gvkCode, { lang: 'yaml', theme: 'dracula' });

  return html`
            <div class="parts d-md-flex justify-content-between mt-md-20 mb-md-20">
                <${PartLabel} type="Kind" value=${Kind} />
                <${PartLabel} type="Group" value=${Group} />
                <${PartLabel} type="Version" value=${Version} />
            </div>

            <hr class="mb-md-20" />
            ${React.createElement("div", { dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(gvkTokens) } })}

            <div class="${properties == null ? 'd-none' : 'd-flex'} flex-row-reverse mb-10 mt-10">
                <button class="btn ml-10" type="button" onClick=${expandAll}>+ expand all</button>
                <button class="btn" type="button" onClick=${collapseAll}>- collapse all</button>
            </div>
            <div class="collapse-group">
                ${properties != null
      ? Object.keys(properties).map(prop => SchemaPart({ key: prop, property: properties[prop] }))
      : html`
                    <p class="font-size-18">
                        This CRD has an empty or unspecified schema.
                    </p>
                    `
    }
            </div>
        `;
}

function SchemaPart({ key, property, parent, parentSlug }) {
  const [props, propKeys, required, type, schema, enumvals] = useMemo(() => {
    let schema = property;
    let props = property.Properties || {};

    let type = property.Type;
    if (type === 'array') {
      const itemsSchema = property.Items.Schema;
      if (itemsSchema.Type !== 'object') {
        type = `[]${itemsSchema.Type}`;
      } else {
        schema = itemsSchema;
        props = itemsSchema.Properties || {};
        type = `[]object`;
      }
    }
    if (property.Enum) {
      type = `${type}: enum`;
    }
    let enumvals = property.Enum ?? [];

    let propKeys = Object.keys(props);

    let required = false;
    if (parent && parent.Required && parent.Required.includes(key)) {
      required = true;
    }
    return [props, propKeys, required, type, schema, enumvals]
  }, [parent, property]);

  const slug = useMemo(() => slugify((parentSlug ? `${parentSlug}-` : '') + key), [parentSlug, key]);
  const fullLink = useMemo(() => {
    const url = new URL(location.href);
    url.hash = `#${slug}`;
    return url.toJSON();
  });
  const isHyperlinked = useCallback(() => location.hash.substring(1).startsWith(slug), [slug]);

  const [isOpen, setIsOpen] = useState((key == "spec" && !parent) || isHyperlinked());

  useEffect(() => {
    const handleHashChange = () => {
      if (!isOpen && isHyperlinked()) {
        setIsOpen(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isOpen]);

  useEffect(() => {
    const collapse = () => setIsOpen(false);
    const expand = () => setIsOpen(true);
    bus.on('collapse-all', collapse);
    bus.on('expand-all', expand);
    return () => {
      bus.off('collapse-all', collapse);
      bus.off('expand-all', expand);
    };
  }, []);

  return html`
        <details class="collapse-panel" open="${isOpen}" onToggle=${e => { setIsOpen(e.target.open); e.stopPropagation(); }}>
            <summary class="collapse-header position-relative">
                ${key} <span class="badge text-muted"><code>${type}</code></span> ${required ? html`<span class="badge badge-primary">required</span>` : ''}
                <button class="btn btn-sm position-absolute right-0 top-0 m-5 copy-url z-10" type="button" data-clipboard-text="${fullLink}">🔗</button>
            </summary>
            <div id="${slug}" class="collapse-content">
                ${enumvals.length > 0 ? html`<div class="property-description mb-10">
                    Enum variants: ${enumvals.map(v => html`<span class="badge text-muted mr-5 mb-5"><code>${v}</code></span>`)}
                </div>` : ''}
                ${React.createElement("div", { className: 'property-description', dangerouslySetInnerHTML: { __html: getDescription(property) } })}
                ${propKeys.length > 0 ? html`<br />` : ''}
                <div class="collapse-group">
                ${propKeys
      .map(propKey => SchemaPart({
        parent: schema, parentKey: key, key: propKey, property: props[propKey], parentSlug: slug
      }))}
                </div>
            </div>
        </details>`;
}

function PartLabel({ type, value }) {
  return html`
        <div class="mt-10">
            <span class="font-weight-semibold font-size-24">${value}</span>
            <br />
            <span class="badge text-muted font-size-12">${type}</span>
        </div>`;
}

render(html`<${CRD} />`, document.querySelector('#renderTarget'));