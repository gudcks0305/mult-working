import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  disabled = false,
  ...props
}) => {
  // 버튼 스타일 매핑
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  };

  return (
    <button
      className={`
        px-4 py-2 rounded transition-colors
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          로딩 중...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button; 