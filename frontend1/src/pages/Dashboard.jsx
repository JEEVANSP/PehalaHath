return (
  <div className="space-y-4 sm:space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Active Incidents */}
      <div className={`p-4 sm:p-6 rounded-xl border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm sm:text-base font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Active Incidents</h3>
          <div className={`p-2 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <AlertCircle className={`h-5 w-5 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <p className={`text-2xl sm:text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{stats.activeIncidents}</p>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>Last 24h</p>
        </div>
      </div>

      {/* Response Teams */}
      <div className={`p-4 sm:p-6 rounded-xl border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm sm:text-base font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Response Teams</h3>
          <div className={`p-2 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <Users className={`h-5 w-5 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <p className={`text-2xl sm:text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{stats.responseTeams}</p>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>Available</p>
        </div>
      </div>

      {/* Open Requests */}
      <div className={`p-4 sm:p-6 rounded-xl border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm sm:text-base font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Open Requests</h3>
          <div className={`p-2 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <ClipboardList className={`h-5 w-5 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <p className={`text-2xl sm:text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{stats.openRequests}</p>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>Pending</p>
        </div>
      </div>
    </div>

    {/* Map and Alerts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Emergency Map */}
      <div className={`rounded-xl border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm overflow-hidden`}>
        <div className="p-4 sm:p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }">
          <h2 className={`text-lg sm:text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Emergency Map</h2>
        </div>
        <div className="h-[300px] sm:h-[400px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDarkMode ? 'border-white' : 'border-gray-900'
              }`} />
            </div>
          ) : (
            <GoogleMap
              defaultCenter={center}
              defaultZoom={13}
              options={{
                styles: isDarkMode ? darkMapStyle : [],
                disableDefaultUI: true,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {alerts.map((alert) => (
                <Marker
                  key={alert._id}
                  position={alert.location}
                  icon={{
                    url: getMarkerIcon(alert.severity),
                    scaledSize: new window.google.maps.Size(30, 30),
                  }}
                />
              ))}
            </GoogleMap>
          )}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className={`rounded-xl border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm`}>
        <div className="p-4 sm:p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }">
          <h2 className={`text-lg sm:text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Recent Alerts</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                } hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)} flex items-center justify-center`}>
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm sm:text-base font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{alert.title}</h3>
                    <p className={`text-xs sm:text-sm mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>{alert.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
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
        </div>
      </div>
    </div>

    {/* Resource Status */}
    <div className={`rounded-xl border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } shadow-sm`}>
      <div className="p-4 sm:p-6 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }">
        <h2 className={`text-lg sm:text-xl font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Resource Status</h2>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource._id}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm sm:text-base ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>{resource.name}</span>
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{resource.available}/{resource.total}</span>
              </div>
              <div className={`h-2 rounded-full ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              } overflow-hidden`}>
                <div
                  className={`h-full rounded-full ${
                    resource.available / resource.total > 0.7
                      ? 'bg-green-500'
                      : resource.available / resource.total > 0.3
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{
                    width: `${(resource.available / resource.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
); 