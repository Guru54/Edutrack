import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Button from './Button';

export default function Modal({ open, onClose, title, description, children, primaryAction, secondaryAction }) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <div className="space-y-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </Dialog.Title>
                  {description && (
                    <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400">
                      {description}
                    </Dialog.Description>
                  )}
                  <div className="text-sm text-gray-700 dark:text-gray-200">{children}</div>
                  {(primaryAction || secondaryAction) && (
                    <div className="flex justify-end gap-3">
                      {secondaryAction && (
                        <Button variant="secondary" onClick={secondaryAction.onClick}>
                          {secondaryAction.label}
                        </Button>
                      )}
                      {primaryAction && (
                        <Button
                          variant={primaryAction.variant || 'primary'}
                          onClick={primaryAction.onClick}
                          loading={primaryAction.loading}
                        >
                          {primaryAction.label}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
