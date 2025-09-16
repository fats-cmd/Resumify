"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const CreateResumeTour = () => {
  const { user } = useAuth();
  const [tour, setTour] = useState<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    // Initialize the tour only on the client side
    if (typeof window !== 'undefined' && user) {
      const driverObj = driver({
        showProgress: true,
        steps: [
          {
            element: '#create-header',
            popover: {
              title: 'Create Your Resume',
              description: 'Welcome to the resume creation page! Let us guide you through the process of creating a professional resume.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#template-selection',
            popover: {
              title: 'Choose a Template',
              description: 'Start by selecting a professional template for your resume. You can preview each template before making your choice.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#personal-info-section',
            popover: {
              title: 'Personal Information',
              description: 'Fill in your personal details like name, email, phone number, and professional headline.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#work-experience-section',
            popover: {
              title: 'Work Experience',
              description: 'Add your work experience with company names, positions, dates, and descriptions of your responsibilities.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#education-section',
            popover: {
              title: 'Education',
              description: 'Include your educational background with institutions, degrees, and dates of attendance.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#skills-section',
            popover: {
              title: 'Skills',
              description: 'List your professional skills that are relevant to the jobs you\'re applying for.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#ai-assistant',
            popover: {
              title: 'AI Assistant',
              description: 'Use our AI-powered tools to help you write compelling summaries, job descriptions, and skill lists.',
              side: "left",
              align: 'start'
            }
          },
          {
            element: '#preview-button',
            popover: {
              title: 'Preview Your Resume',
              description: 'Click the preview button at any time to see how your resume will look with the selected template.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#save-resume',
            popover: {
              title: 'Save Your Resume',
              description: 'When you\'re done, save your resume. You can always come back later to edit it.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            popover: {
              title: 'You\'re Ready!',
              description: 'You now know how to create a professional resume. Start building your perfect resume now!',
              side: "bottom",
              align: 'start'
            }
          }
        ]
      });

      setTour(driverObj);

      // Check if it's the user's first visit to the create page
      const hasVisitedCreate = localStorage.getItem('hasVisitedCreatePage');
      if (!hasVisitedCreate) {
        // Start the tour automatically for first-time users
        setTimeout(() => {
          driverObj.drive();
        }, 1000);
        localStorage.setItem('hasVisitedCreatePage', 'true');
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

export default CreateResumeTour;