"use client";

import { TbLayoutSidebar } from "react-icons/tb";

export default function TestSidebarIcon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-[#0C111D] p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Sidebar Icon Test</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <TbLayoutSidebar className="text-4xl text-blue-500" />
          <span className="text-lg text-gray-700 dark:text-gray-300">TbLayoutSidebar Icon</span>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            <TbLayoutSidebar className="inline mr-2" />
            Toggle Sidebar
          </button>
          
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
            <TbLayoutSidebar className="inline mr-2" />
            Menu
          </button>
        </div>
      </div>
    </div>
  );
}