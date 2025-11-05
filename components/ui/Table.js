import clsx from 'clsx';

export default function Table({ headers, data, renderRow, className }) {
  return (
    <div className={clsx('overflow-x-auto -mx-4 md:mx-0', className)}>
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-3 md:px-6 py-3 md:py-4 text-center text-gray-500 text-sm">
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {renderRow(item)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
