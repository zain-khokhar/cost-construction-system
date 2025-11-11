import clsx from 'clsx';

export default function Table({ headers, data, renderRow, className }) {
  return (
    <div className={clsx('overflow-x-auto max-lg:max-w-[90vw]', className)}>
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 max-sm:p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-4 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 max-sm:[&>td]:whitespace-nowrap max-sm:[&>td]:overflow-hidden max-sm:[&>td]:text-ellipsis max-sm:[&>td]:max-w-[100px]">
                {renderRow(item)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
