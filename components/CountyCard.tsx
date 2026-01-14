import Link from 'next/link';
import { County } from '@/types';

export function CountyCard({ county }: { county: County }) {
  const statusColor = county.scrapingStatus === 'completed' 
    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
    : county.scrapingStatus === 'failed'
    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';

  return (
    <Link
      href={`/counties/${county.countyId}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {county.countyName}
        </h3>
        {county.scrapingStatus && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {county.scrapingStatus}
          </span>
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Properties:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {county.propertyCount}
          </span>
        </div>
        
        {county.lastScraped && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Last Scraped:</span>
            <span className="text-gray-900 dark:text-white">
              {new Date(county.lastScraped).toLocaleDateString()}
            </span>
          </div>
        )}

        {county.errorMessage && (
          <div className="mt-2 text-xs text-red-600 dark:text-red-400">
            {county.errorMessage}
          </div>
        )}
      </div>
    </Link>
  );
}
