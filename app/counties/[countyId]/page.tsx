'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/Loading';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { County, Property } from '@/types';
import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function CountyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname()
  const page = Number(searchParams.get('page') ?? 1)
  const countyId = params.countyId as string;

  const [county, setCounty] = useState<County | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (countyId) {
      const controller = new AbortController()
      const signal = controller.signal
      const run = async () => {
        await Promise.all([
          fetchCountyDetails(signal),
          fetchProperties(page, signal)
        ])
      }
      
      run()

      return () => controller.abort()
    }
  }, [countyId, page]);

  const fetchCountyDetails = async (signal?: AbortSignal) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/counties/${countyId}`, { signal });
      const data = await response.json();

      if (data.success) {
        setCounty(data.data);
      } else {
        setError('Failed to fetch county details');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') setError('Error connecting to API');
    }
  };

  const fetchProperties = async (page: number, signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_URL}/api/counties/${countyId}/properties?page=${page}`,
        { signal }
      );
      const data = await response.json();

      if (data.success) {
        setProperties(data.data);
        setTotalPages(data.totalPages || 1);
      } else {
        setError('Failed to fetch properties');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') setError('Error connecting to API');
    } finally {
      setLoading(false);
    }
  };

  const handleRefetch = async () => {
    try {
      console.log("refetch is calling")
      setRefetching(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/counties/${countyId}/refetch`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        setError('Refetch request failed');
      }

      // Immediately refresh UI (backend might still be processing, but you’ll at least show status changes)
      await Promise.all([
        fetchCountyDetails(),
        fetchProperties(page),
      ])
    } catch (err: any) {
      setError('Error refetching county');
    } finally {
      setRefetching(false);
    }
  };

  if (!county && !loading) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-muted-foreground mb-4">County not found</p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Counties
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const variant = status === 'completed' ? 'default' : status === 'failed' ? 'destructive' : 'secondary';
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

  const gotoPage = (nextPage: number) => {
    if (nextPage < 1) return;
    const sp = new URLSearchParams(searchParams.toString())
    sp.set("page", String(nextPage))

    router.push(`${pathname}?${sp.toString()}`, { scroll: true })
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Counties
          </Button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">
          {county?.countyName || 'Loading...'}
        </span>
      </div>

      {/* County Details Card */}
      {county && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{county.countyName}</CardTitle>
                {county.url && (
                  <a
                    href={county.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View on SalesWeb
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <Button onClick={handleRefetch} disabled={refetching}>
                {refetching ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Refetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refetch
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Property Count</p>
                <p className="text-2xl font-bold">{county.propertyCount}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <div className="mt-1">
                  {getStatusBadge(county.scrapingStatus || 'Unknown')}
                </div>
              </div>

              {county.lastScraped && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Scraped</p>
                  <p className="text-lg font-semibold">
                    {new Date(county.lastScraped).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(county.lastScraped).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {county.createdAt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="text-lg font-semibold">
                    {new Date(county.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {county.errorMessage && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  <strong>Error:</strong> {county.errorMessage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && <ErrorMessage message={error} />}

      {/* Properties Section */}
      <Card>
        <CardHeader>
          <CardTitle>Properties ({properties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : properties.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Plaintiff</TableHead>
                    <TableHead>Defendant</TableHead>
                    <TableHead className="text-right">Starting Bid</TableHead>
                    <TableHead className="text-right">Appraised Value</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => {
                    const currentStatus = property.status_history?.length > 0
                      ? property.status_history[property.status_history.length - 1]
                      : null;
                    return (
                      <TableRow key={property._id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/properties/${property.stableId}?countyId=${countyId}`}
                            className="hover:underline text-primary"
                          >
                            {stripHtml(property.addressLine) || stripHtml(property.details?.['address/description']) || stripHtml(property.details?.address) || 'Address not available'}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          {property.details?.case_title?.split(' vs ')[0] || property.details?.plaintiff || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {property.details?.case_title?.split(' vs ')[1] || property.details?.defendant || property.defendant || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {stripHtml(property.details?.opening_bid) || stripHtml(property.details?.starting_bid) || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {stripHtml(property.details?.appraisal_amount) || stripHtml(property.details?.appraised_value) || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {currentStatus && (
                            <Badge variant="secondary" className="text-xs">
                              {currentStatus.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/properties/${property.stableId}?countyId=${countyId}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    onClick={() => gotoPage(page-1)}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    onClick={() => gotoPage(page + 1)}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No properties found for this county.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
