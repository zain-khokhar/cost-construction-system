import clsx from 'clsx';

export default function Card({ children, title, className }) {
  return (
    <div className={clsx('bg-white border border-gray-200 rounded-lg p-4 md:p-6 text-gray-900', className)}>
      {title && <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-900">{title}</h3>}
      {children}
    </div>
  );
}
