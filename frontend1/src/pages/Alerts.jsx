return (
  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header Section */}
    <div className="relative mb-6 sm:mb-8">
      <div className={`absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl opacity-90`} />
      <div className="relative p-4 sm:p-6 lg:p-8">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className={`p-2 sm:p-3 rounded-xl bg-white/10 backdrop-blur-sm`}>
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Emergency Alerts</h1>
            <p className="text-sm sm:text-base text-white/80 mt-1">Stay informed about active emergency situations</p>
          </div>
        </div>
      </div>
    </div>

    {/* Search and Filter Section */}
    <div className={`p-3 sm:p-4 lg:p-6 rounded-xl border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } shadow-sm mb-4 sm:mb-6`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative">
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
            placeholder="Search alerts..."
          />
        </div>

        {/* Severity Filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
        >
          <option value="">All Severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="severity">Severity</option>
        </select>
      </div>
    </div>

    {/* Alerts Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      {filteredAlerts.map((alert) => (
        <div
          key={alert._id}
          className={`p-3 sm:p-4 lg:p-6 rounded-xl border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
          onClick={() => setSelectedAlert(alert)}
        >
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className={`p-1.5 sm:p-2 rounded-lg ${getSeverityColor(alert.severity)} flex items-center justify-center`}>
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm sm:text-base font-medium truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{alert.title}</h3>
              <p className={`text-xs sm:text-sm mt-1 line-clamp-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>{alert.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {new Date(alert.createdAt).toLocaleString()}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  getSeverityBadgeColor(alert.severity)
                }`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Alert Details Modal */}
    {selectedAlert && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          </div>

          <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="sm:flex sm:items-start">
                <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${getSeverityColor(selectedAlert.severity)}`}>
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className={`text-base sm:text-lg leading-6 font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedAlert.title}
                  </h3>
                  <div className="mt-2">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {selectedAlert.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${
              isDarkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-gray-50 border-t border-gray-200'
            }`}>
              <button
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-sm sm:text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto`}
                onClick={() => setSelectedAlert(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
); 