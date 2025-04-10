import React from 'react';
import {
  DocumentTextIcon,
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const CompanyTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BuildingOfficeIcon className="h-5 w-5" />,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: <DocumentTextIcon className="h-5 w-5" />,
    },
    {
      id: 'files',
      label: 'Files',
      icon: <PaperClipIcon className="h-5 w-5" />,
    },
    {
      id: 'chat',
      label: 'Team Chat',
      icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
    },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`
              flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }
            `}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CompanyTabs;
