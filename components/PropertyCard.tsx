import Link from 'next/link';
import { Property } from '@/types';

export function PropertyCard({ property }: { property: Property }) {
  const currentStatus = property.status_history?.length > 0
    ? property.status_history[property.status_history.length - 1]
    : null;

  // Extract text from HTML string
  const stripHtml = (html: string | undefined): string => {
    if (!html) return '';
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      return textarea.value;
    }
    return text;
  };

  const displayAddress = stripHtml(property.addressLine) || 
    stripHtml(property.details?.['address/description']) || 
    'Address not available';

  return (
    <Link
      href={`/properties/${property.stableId}?countyId=${property.countyId}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {displayAddress}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {property.countyName}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {(property.details?.case_title || property.details?.plaintiff) && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Plaintiff: </span>
            <span className="text-gray-900 dark:text-white">
              {property.details.case_title || property.details.plaintiff}
            </span>
          </div>
        )}

        {(property.details?.defendant || property.defendant) && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Defendant: </span>
            <span className="text-gray-900 dark:text-white">
              {property.details.defendant || property.defendant}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          {(property.details?.opening_bid || property.details?.starting_bid) && (
            <div>
              <span className="text-gray-600 dark:text-gray-400 block text-xs">
                Starting Bid
              </span>
              <span className="text-gray-900 dark:text-white font-medium">
                {stripHtml(property.details.opening_bid) || stripHtml(property.details.starting_bid)}
              </span>
            </div>
          )}

          {(property.details?.appraisal_amount || property.details?.appraised_value) && (
            <div>
              <span className="text-gray-600 dark:text-gray-400 block text-xs">
                Appraised Value
              </span>
              <span className="text-gray-900 dark:text-white font-medium">
                {stripHtml(property.details.appraisal_amount) || stripHtml(property.details.appraised_value)}
              </span>
            </div>
          )}
        </div>

        {currentStatus && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {currentStatus.status}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {currentStatus.date}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
