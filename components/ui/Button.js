import clsx from 'clsx';

export default function Button({ children, variant = 'primary', size = 'md', type = 'button', onClick, disabled, className, ...props }) {
  const baseStyles = 'rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(baseStyles, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
