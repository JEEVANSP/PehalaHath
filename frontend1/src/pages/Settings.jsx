import React from 'react';
import {
  Moon,
  Bell,
  Shield,
  Globe,
  Smartphone,
  HelpCircle,
  ChevronRight,
  Sun,
} from 'lucide-react';
import { useThemeStore } from '../store/theme';

export function Settings() {
  const { isDarkMode, toggleTheme } = useThemeStore();

  const settingsSections = [
    {
      title: 'App Preferences',
      items: [
        {
          icon: isDarkMode ? Sun : Moon,
          label: 'Dark Mode',
          value: isDarkMode ? 'On' : 'Off',
          onClick: toggleTheme,
          toggle: true,
        },
        {
          icon: Bell,
          label: 'Notifications',
          value: 'All notifications',
          onClick: () => {},
        },
        {
          icon: Globe,
          label: 'Language',
          value: 'English',
          onClick: () => {},
        },
      ],
    },
    {
      title: 'Emergency Settings',
      items: [
        {
          icon: Smartphone,
          label: 'Emergency SMS Settings',
          value: 'Configured',
          onClick: () => {},
        },
        {
          icon: Shield,
          label: 'Privacy Settings',
          value: 'Enhanced',
          onClick: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Documentation',
          onClick: () => {},
        },
        {
          icon: Shield,
          label: 'Terms of Service',
          onClick: () => {},
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          onClick: () => {},
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {settingsSections.map((section) => (
        <div
          key={section.title}
          className={`${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow-lg overflow-hidden`}
        >
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">{section.title}</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {section.items.map((item) => (
              <div
                key={item.label}
                onClick={item.onClick}
                className={`flex items-center justify-between p-4 hover:bg-opacity-50 cursor-pointer ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon
                    className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.value && (
                    <span
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {item.value}
                    </span>
                  )}
                  {item.toggle ? (
                    <div
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isDarkMode ? 'bg-red-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDarkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  ) : (
                    <ChevronRight
                      className={`h-5 w-5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div
        className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow-lg p-4 text-center`}
      >
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          DisasterWatch v1.0.0
        </p>
      </div>
    </div>
  );
}
