import React from 'react';
import clsx from 'clsx';

export default function Card({ title, description, actions, children, className, headerRight }) {
  return (
    <div className={clsx('rounded-2xl border border-gray-200 bg-white p-5 shadow-card dark:border-gray-800 dark:bg-gray-900', className)}>
      {(title || actions || headerRight) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
            {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
          </div>
          {headerRight || actions}
        </div>
      )}
      {children}
    </div>
  );
}
