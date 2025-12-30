"use client";
import { useState, Children, cloneElement, isValidElement } from "react";

interface ProfileTabsProps {
  children: React.ReactNode;
  tabs: {
    id: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  defaultTab?: string;
}

export default function ProfileTabs({ children, tabs, defaultTab }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  return (
    <div>
      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {Children.map(children, (child) => {
          if (isValidElement(child)) {
            const tabId = child.props['data-tab'];
            return cloneElement(child as React.ReactElement<any>, {
              style: { display: activeTab === tabId ? 'block' : 'none' }
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}
