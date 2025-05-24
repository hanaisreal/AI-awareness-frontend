'use client'
import { useState } from 'react';

export default function ReflectionForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Reflect on Your Experience</h2>
      
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">
              How convincing was the voice clone?
              <select className="w-full mt-1 rounded border-gray-300 shadow-sm" required>
                <option value="">Select an option</option>
                <option value="very">Very convincing</option>
                <option value="somewhat">Somewhat convincing</option>
                <option value="not">Not convincing</option>
              </select>
            </label>
          </div>
          
          <div>
            <label className="block mb-2">
              What steps will you take to protect yourself from voice cloning scams?
              <textarea 
                className="w-full mt-1 rounded border-gray-300 shadow-sm"
                rows={4}
                required
              />
            </label>
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Submit Reflection
          </button>
        </form>
      ) : (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Thank you for participating!</h3>
          <p className="text-gray-600">
            Remember to always verify the identity of callers and never share sensitive information over the phone.
          </p>
        </div>
      )}
    </div>
  );
} 