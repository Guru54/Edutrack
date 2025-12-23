import React from 'react';
import clsx from 'clsx';
import { getStatusLabel } from '../../utils/helpers';

const statusStyles = {
  proposed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100',
  pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-100',
  submitted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
  needs_revision: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
};

export default function Badge({ status = 'pending', children, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
        statusStyles[status] || statusStyles.pending,
        className
      )}
    >
      {children || getStatusLabel(status)}
    </span>
  );
}
