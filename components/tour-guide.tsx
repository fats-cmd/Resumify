"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TourGuide = () => {
  const { user } = useAuth();
  const [tour, setTour] = useState<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    // Initialize the tour only on the client side
    if (typeof window !== 'undefined' && user) {
      const driverObj = driver({
        showProgress: true,
        steps: [
          {
            element: '#dashboard-header',
            popover: {
              title: 'Welcome to Resumify!',
              description: 'This is your dashboard where you can manage all your resumes. Let us give you a quick tour.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#stats-cards',
            popover: {
              title: 'Your Statistics',
              description: 'Here you can see an overview of your resume activity including total resumes, published resumes, views, and downloads.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#create-resume-btn',
            popover: {
              title: 'Create New Resume',
              description: 'Click here to create a new professional resume. You\'ll be able to choose from various templates.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#resume-list',
            popover: {
              title: 'Your Resumes',
              description: 'This section shows all your created resumes. You can view, edit, duplicate, or delete them from here.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#resume-actions',
            popover: {
              title: 'Resume Actions',
              description: 'For each resume, you can view it, edit it, duplicate it, or delete it using these action buttons.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#user-profile',
            popover: {
              title: 'Your Profile',
              description: 'Access your profile settings, account information, and logout option from here.',
              side: "left",
              align: 'start'
            }
          },
          {
            element: '#sidebar-menu',
            popover: {
              title: 'Navigation Menu',
              description: 'Use this sidebar to navigate between different sections of the application like Dashboard, My Resumes, Templates, and Settings.',
              side: "right",
              align: 'start'
            }
          },
          {
            element: '#theme-toggle',
            popover: {
              title: 'Theme Toggle',
              description: 'Switch between light and dark mode based on your preference.',
              side: "left",
              align: 'start'
            }
          },
          {
            popover: {
              title: 'Tour Completed!',
              description: 'You\'re all set! Start creating your professional resume now.',
              side: "bottom",
              align: 'start'
            }
          }
        ]
      });

      setTour(driverObj);

      // Check if it's the user's first visit
      const hasVisited = localStorage.getItem('hasVisitedDashboard');
      if (!hasVisited) {
        // Start the tour automatically for first-time users
        setTimeout(() => {
          driverObj.drive();
        }, 1000);
        localStorage.setItem('hasVisitedDashboard', 'true');
      }
    }
  }, [user]);

  const startTour = () => {
    if (tour) {
      tour.drive();
    }
  };

  return (
    <button
      onClick={startTour}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-3 shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
      aria-label="Start tour"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  );
};

export default TourGuide;