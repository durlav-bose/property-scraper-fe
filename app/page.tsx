'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Database, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/Loading';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { County, FailedCountiesResponse, FailedPropertiesResponse, Property } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function HomePage() {
  const [counties, setCounties] = useState<County[]>([]);
  const [failedCounties, setFailedCounties] = useState<County[]>([]);
  const [failedProperties, setFailedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitCounties, setLimitCounties] = useState<number>(2);
  const [showFailed, setShowFailed] = useState(false);
  const [refetching, setRefetching] = useState<string | null>(null);

  useEffect(() => {
    fetchCounties();
  }, []);

  const fetchCounties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/counties`);
      const data = await response.json();
      
      if (data.success) {
        setCounties(data.data);
      } else {
        setError('Failed to fetch counties');
      }
    } catch (err) {
      setError('Error connecting to API');
    } finally {
      setLoading(false);
    }
  };

  const fetchFailedItems = async () => {
    try {
      const [countiesRes, propertiesRes] = await Promise.all([
        fetch(`${API_URL}/api/failed/counties`),
        fetch(`${API_URL}/api/failed/properties`)
      ]);

      const countiesData: FailedCountiesResponse = await countiesRes.json();
      const propertiesData: FailedPropertiesResponse = await propertiesRes.json();

      if (countiesData.success) {
        setFailedCounties(countiesData.data);
      }
      if (propertiesData.success) {
        setFailedProperties(propertiesData.data);
      }
      setShowFailed(true);
    } catch (err) {
      setError('Error fetching failed items');
    }
  };

  const handleScrape = async () => {
    try {
      setScraping(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limitCounties }),
      });

      const data = await response.json();
      
      if (data.success) {
        // alert('Scraping started successfully!');
        setTimeout(fetchCounties, 2000);
      } else {
        setError('Failed to start scraping');
      }
    } catch (err) {
      setError('Error starting scrape');
    } finally {
      setScraping(false);
    }
  };

  const handleRefetchCounty = async (countyId: string) => {
    try {
      setRefetching(countyId);
      const response = await fetch(`${API_URL}/api/counties/${countyId}/refetch`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        // alert('County refetch started!');
        fetchFailedItems();
        setTimeout(fetchCounties, 2000);
      } else {
        setError('Failed to refetch county');
      }
    } catch (err) {
      setError('Error refetching county');
    } finally {
      setRefetching(null);
    }
  };

  const handleRefetchProperty = async (stableId: string, countyId: string) => {
    try {
      setRefetching(stableId);
      const response = await fetch(`${API_URL}/api/properties/stable/${stableId}/refetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countyId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // alert('Property refetch started!');
        fetchFailedItems();
      } else {
        setError('Failed to refetch property');
      }
    } catch (err) {
      setError('Error refetching property');
    } finally {
      setRefetching(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variant = status === 'completed' 
      ? 'default' 
      : status === 'failed' 
      ? 'destructive' 
      : 'secondary';
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  // Extract text from HTML string
  const stripHtml = (html: string | undefined): string => {
    if (!html) return '';
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle>Counties Dashboard</CardTitle>
          <CardDescription>
            Manage and monitor property scraping across counties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center justify-left">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Limit Counties:</label>
              <Input
                type="number"
                value={limitCounties}
                onChange={(e) => setLimitCounties(parseInt(e.target.value) || 1)}
                className="w-20 h-7"
                min="1"
              />
              <Button onClick={handleScrape} disabled={scraping}>
                {scraping ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Database />
                    Start Scrape
                  </>
                )}
              </Button>
            </div>

            <Button onClick={fetchFailedItems} variant="destructive">
              <AlertCircle />
              View Failed Items
            </Button>

            <Button onClick={fetchCounties} variant="outline">
              <RefreshCw />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <ErrorMessage message={error} />}

      {/* Failed Items Section */}
      {showFailed && (failedCounties.length > 0 || failedProperties.length > 0) && (
        <div className="space-y-4">
          {failedCounties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">
                  Failed Counties ({failedCounties.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {failedCounties.map((county) => (
                    <div
                      key={county._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{county.countyName}</p>
                        {county.errorMessage && (
                          <p className="text-sm text-destructive mt-1">
                            {county.errorMessage}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleRefetchCounty(county.countyId)}
                        disabled={refetching === county.countyId}
                        size="sm"
                      >
                        {refetching === county.countyId ? 'Refetching...' : 'Refetch'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {failedProperties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">
                  Failed Properties ({failedProperties.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {failedProperties.map((property) => (
                    <div
                      key={property._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {stripHtml(property.details?.address) || stripHtml(property.addressLine) || 'Address not available'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {property.countyName}
                        </p>
                        {property.errorMessage && (
                          <p className="text-sm text-destructive mt-1">
                            {property.errorMessage}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleRefetchProperty(property.stableId, property.countyId)}
                        disabled={refetching === property.stableId}
                        size="sm"
                      >
                        {refetching === property.stableId ? 'Refetching...' : 'Refetch'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Counties Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Counties ({counties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : counties.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>County Name</TableHead>
                  <TableHead className="text-center">Properties</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Last Scraped</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counties.map((county) => (
                  <TableRow key={county._id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/counties/${county.countyId}`}
                        className="hover:underline text-primary"
                      >
                        {county.countyName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      {county.propertyCount}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(county.scrapingStatus)}
                    </TableCell>
                    <TableCell>
                      {county.lastScraped 
                        ? new Date(county.lastScraped).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/counties/${county.countyId}?page=1`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No counties found. Start a scrape to fetch data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
