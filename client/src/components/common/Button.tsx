import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

interface ButtonProps extends MuiButtonProps {
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  color = 'primary',
  isLoading = false,
  children,
  disabled = false,
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
          로딩 중...
        </>
      ) : (
        children
      )}
    </MuiButton>
  );
};

export default Button; 