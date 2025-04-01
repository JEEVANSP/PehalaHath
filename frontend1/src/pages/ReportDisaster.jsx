return (
  <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header Section */}
    <div className="relative mb-6 sm:mb-8">
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl opacity-90`} />
      <div className="relative p-4 sm:p-6 lg:p-8">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className={`p-2 sm:p-3 rounded-xl bg-white/10 backdrop-blur-sm`}>
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Report Disaster</h1>
            <p className="text-sm sm:text-base text-white/80 mt-1">Quickly report emergency incidents for immediate response</p>
          </div>
        </div>
      </div>
    </div>

    {/* Form Section */}
    <div className={`p-3 sm:p-4 lg:p-6 rounded-xl border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } shadow-sm`}>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className={`block text-sm font-medium mb-1.5 sm:mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Incident Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Enter incident title"
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className={`block text-sm font-medium mb-1.5 sm:mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Describe the incident in detail"
            required
          />
        </div>

        {/* Location Input */}
        <div>
          <label htmlFor="location" className={`block text-sm font-medium mb-1.5 sm:mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Location
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter location or use current location"
              required
            />
          </div>
        </div>

        {/* Severity Selection */}
        <div>
          <label className={`block text-sm font-medium mb-1.5 sm:mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Severity Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {['Low', 'Medium', 'High', 'Critical'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleChange({ target: { name: 'severity', value: level } })}
                className={`p-2 sm:p-3 rounded-lg border text-sm font-medium transition-colors ${
                  formData.severity === level
                    ? getSeverityColor(level)
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className={`block text-sm font-medium mb-1.5 sm:mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Upload Images
          </label>
          <div className={`mt-1 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-5 sm:pb-6 border-2 border-dashed rounded-lg ${
            isDarkMode 
              ? 'border-gray-600 bg-gray-700/50' 
              : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="space-y-1 text-center">
              <div className={`flex text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <label
                  htmlFor="images"
                  className={`relative cursor-pointer rounded-md font-medium ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                  } focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2`}
                >
                  <span>Upload files</span>
                  <input
                    id="images"
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="h-20 sm:h-24 w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2 sm:pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 sm:px-6 py-2 rounded-lg text-white text-sm sm:text-base font-medium ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2`}
          >
            {loading ? (
              <>
                <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white`} />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                <span>Report Incident</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
); 