import React, { useState } from 'react';
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
import { toast } from 'react-hot-toast';

export function Settings() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [notificationSetting, setNotificationSetting] = useState('all');
  const [language, setLanguage] = useState('English');
  const [emergencySMS, setEmergencySMS] = useState('configured');
  const [privacyLevel, setPrivacyLevel] = useState('enhanced');

  const handleNotificationChange = () => {
    const options = ['all', 'important', 'none'];
    const currentIndex = options.indexOf(notificationSetting);
    const nextSetting = options[(currentIndex + 1) % options.length];
    setNotificationSetting(nextSetting);
    toast.success(`Notifications set to ${nextSetting}`);
  };

  const handleLanguageChange = () => {
    const languages = ['English', 'Spanish', 'French'];
    const currentIndex = languages.indexOf(language);
    const nextLanguage = languages[(currentIndex + 1) % languages.length];
    setLanguage(nextLanguage);
    toast.success(`Language changed to ${nextLanguage}`);
  };

  const handleEmergencySMSSettings = () => {
    const options = ['configured', 'pending', 'disabled'];
    const currentIndex = options.indexOf(emergencySMS);
    const nextSetting = options[(currentIndex + 1) % options.length];
    setEmergencySMS(nextSetting);
    toast.success(`Emergency SMS ${nextSetting}`);
  };

  const handlePrivacySettings = () => {
    const options = ['enhanced', 'standard', 'basic'];
    const currentIndex = options.indexOf(privacyLevel);
    const nextSetting = options[(currentIndex + 1) % options.length];
    setPrivacyLevel(nextSetting);
    toast.success(`Privacy level set to ${nextSetting}`);
  };

  const openDocumentation = () => {
    window.open('/documentation', '_blank');
    toast.success('Opening documentation');
  };

  const openTerms = () => {
    window.open('/terms', '_blank');
    toast.success('Opening Terms of Service');
  };

  const openPrivacyPolicy = () => {
    window.open('/privacy', '_blank');
    toast.success('Opening Privacy Policy');
  };

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
          value: `${notificationSetting.charAt(0).toUpperCase()}${notificationSetting.slice(1)}`,
          onClick: handleNotificationChange,
        },
        {
          icon: Globe,
          label: 'Language',
          value: language,
          onClick: handleLanguageChange,
        },
      ],
    },
    {
      title: 'Emergency Settings',
      items: [
        {
          icon: Smartphone,
          label: 'Emergency SMS Settings',
          value: emergencySMS.charAt(0).toUpperCase() + emergencySMS.slice(1),
          onClick: handleEmergencySMSSettings,
        },
        {
          icon: Shield,
          label: 'Privacy Settings',
          value: privacyLevel.charAt(0).toUpperCase() + privacyLevel.slice(1),
          onClick: handlePrivacySettings,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Documentation',
          onClick: openDocumentation,
        },
        {
          icon: Shield,
          label: 'Terms of Service',
          onClick: openTerms,
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          onClick: openPrivacyPolicy,
        },
      ],
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
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
      </div>
    </div>
  );
}
