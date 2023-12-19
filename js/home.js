import { render } from 'react-dom'
import { html } from 'htm/react'
import { useTable, useSortBy } from 'react-table'

const { Tag, Rows } = JSON.parse(document.getElementById('pageData').textContent);
const data = Rows;

function renderLink(row, linkText) {
  const href = `/${Tag}/${row.Group}/${row.Kind}/${row.Version}`;

  return html`<a href=${href}>${linkText}</a>`;
}

const columns = [
  {
    Header: 'Kind',
    accessor: 'Kind',
    Cell: ({ row: { original }, value }) => renderLink(original, value)
  },
  {
    Header: 'Group',
    accessor: 'Group'
  },
  {
    Header: 'Version',
    accessor: 'Version'
  },
  {
    Header: 'Operator',
    accessor: 'Repo'
  }
];

function CRDHeader(column) {
  let bla = (column.isSorted
    ? column.isSortedDesc
      ? html`<i className="fas fa-sort-down"></i>`
      : html`<i className="fas fa-sort-up"></i>`
    : html`<i className="fas fa-sort"></i>`)
  return html`<th ...${column.getHeaderProps(column.getSortByToggleProps())}>
        ${column.render('Header')}
        <span className="sort-header ${column.isSorted ? 'sort-header-active' : ''}">
            ${bla}
        </span>
    </th>`
}

function CRDTable() {
  const table = useTable({ columns, data }, useSortBy);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = table;

  return html`
    <div className="table-responsive">
        <table className="table table-striped table-outer-bordered" ...${getTableProps()}>
            <thead>
                ${headerGroups.map(group => html`
                <tr ...${group.getHeaderGroupProps()}>
                    ${group.headers.map(CRDHeader)}
                </tr>
                `)}
            </thead>
            <tbody ...${getTableBodyProps()}>
                ${rows.map(row => {
    prepareRow(row)
    return html`
                <tr ...${row.getRowProps()}>
                    ${row.cells.map(cell => html`
                    <td ...${cell.getCellProps()}>${cell.render('Cell')}</td>
                    `)}
                </tr>
                `
  })}
            </tbody>
        </table>
    </div>`;
}

render(html`<${CRDTable} />`, document.getElementById("crds"));
