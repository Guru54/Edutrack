import React from 'react';
import clsx from 'clsx';

export default function Spinner({ size = 'md', className }) {
  const dimension = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  return (
    <span
      className={clsx(
        'inline-block animate-spin rounded-full border-2 border-brand-500 border-t-transparent',
        dimension,
        className
      )}
    />
  );
}
