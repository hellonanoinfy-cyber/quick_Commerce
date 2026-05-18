'use client';

export default function AdminTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  empty = 'No records found',
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-left">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(row => (
              <tr key={row[rowKey]} className="hover:bg-pink-50/40">
                {columns.map(column => (
                  <td key={column.key} className="px-4 py-4 text-sm font-bold text-gray-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="p-8 text-center text-sm font-bold text-gray-400">{empty}</div>
      )}
    </div>
  );
}
