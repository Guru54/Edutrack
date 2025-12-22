import React from 'react';
import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900">
      {Icon && <Icon className="mb-3 h-10 w-10 text-gray-400" />}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      {action && (
        <div className="mt-4">
          <Button onClick={action.onClick} variant={action.variant || 'primary'}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
