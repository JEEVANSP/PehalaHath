import React, { useState } from 'react';
import { Package, Plus, Filter, Search, ArrowUpDown } from 'lucide-react';

const mockResources = [
  {
    id: '1',
    name: 'Medical Supplies Kit',
    category: 'medical',
    quantity: 50,
    unit: 'kits',
    location: 'Central Hospital',
    status: 'available',
    providedBy: {
      id: '1',
      name: 'Medical Team Alpha',
      email: 'medical@example.com',
      role: 'authority'
    },
    timestamp: new Date().toISOString(),
    description: 'Emergency medical supplies including bandages, antiseptics, and basic medications',
    urgency: 'high'
  },
  {
    id: '2',
    name: 'Emergency Food Packages',
    category: 'food',
    quantity: 200,
    unit: 'packages',
    location: 'Distribution Center A',
    status: 'available',
    providedBy: {
      id: '2',
      name: 'Food Relief Team',
      email: 'food@example.com',
      role: 'volunteer'
    },
    timestamp: new Date().toISOString(),
    description: 'Non-perishable food items sufficient for a family of 4 for 3 days',
    urgency: 'medium'
  }
];

export function Resources() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
          <Plus className="h-5 w-5 mr-2" />
          Add Resource
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Search resources..."
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="medical">Medical</option>
                <option value="food">Food</option>
                <option value="shelter">Shelter</option>
                <option value="clothing">Clothing</option>
                <option value="equipment">Equipment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="requested">Requested</option>
                <option value="allocated">Allocated</option>
              </select>
            </div>

            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-5 w-5 mr-2 text-gray-400" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="min-w-full divide-y divide-gray-200">
          <div className="bg-gray-50">
            <div className="grid grid-cols-6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Resource</div>
              <div>Quantity</div>
              <div>Location</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
          </div>

          <div className="bg-white divide-y divide-gray-200">
            {mockResources.map((resource) => (
              <div key={resource.id} className="grid grid-cols-6 px-6 py-4 items-center">
                <div className="col-span-2">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-gray-400" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                      <div className="text-sm text-gray-500">{resource.category}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-900">{resource.quantity}</span>
                  <span className="text-sm text-gray-500"> {resource.unit}</span>
                </div>
                <div className="text-sm text-gray-900">{resource.location}</div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    resource.status === 'available' ? 'bg-green-100 text-green-800' :
                    resource.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {resource.status}
                  </span>
                </div>
                <div>
                  <button className="text-sm text-red-600 hover:text-red-900">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resources;
