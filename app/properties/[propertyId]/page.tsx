'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ExternalLink, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/Loading';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { Property } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/properties/${propertyId}`);
      const data = await response.json();

      if (data.success) {
        setProperty(data.data);
      } else {
        setError('Failed to fetch property details');
      }
    } catch (err) {
      setError('Error connecting to API');
    } finally {
      setLoading(false);
    }
  };

  const handleRefetch = async () => {
    try {
      setRefetching(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/properties/${propertyId}/refetch`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // alert('Property refetch started!');
        setTimeout(fetchPropertyDetails, 2000);
      } else {
        setError('Failed to refetch property');
      }
    } catch (err) {
      setError('Error refetching property');
    } finally {
      setRefetching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-muted-foreground mb-4">Property not found</p>
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
        {property.countyId && (
          <>
            <Link href={`/counties/${property.countyId}`}>
              <Button variant="ghost" size="sm">
                {property.countyName}
              </Button>
            </Link>
            <span className="text-muted-foreground">/</span>
          </>
        )}
        <span className="text-muted-foreground">Property Details</span>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Main Property Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">
                {property.details?.address || 'Address not available'}
              </CardTitle>
              <CardDescription className="text-lg">
                {property.countyName}
              </CardDescription>
              {property.detailUrl && (
                <a
                  href={property.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
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
        <CardContent className="space-y-6">

        {/* Key Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {property.details?.address && (
            <InfoRow label="Address" value={property.details.address} />
          )}
          {property.details?.sales_date && (
            <InfoRow label="Sales Date" value={property.details.sales_date} highlight />
          )}
          {property.details?.plaintiff && (
            <InfoRow label="Plaintiff" value={property.details.plaintiff} />
          )}
          {property.details?.defendant && (
            <InfoRow label="Defendant" value={property.details.defendant} />
          )}
          {property.details?.starting_bid && (
            <InfoRow label="Starting Bid" value={property.details.starting_bid} highlight />
          )}
          {property.details?.appraised_value && (
            <InfoRow label="Appraised Value" value={property.details.appraised_value} highlight />
          )}
          {property.details?.['sheriff_#'] && (
            <InfoRow label="Sheriff #" value={property.details['sheriff_#']} />
          )}
          {property.details?.['court_case_#'] && (
            <InfoRow label="Court Case #" value={property.details['court_case_#']} />
          )}
          {property.details?.attorney && (
            <InfoRow label="Attorney" value={property.details.attorney} />
          )}
          {property.details?.['parcel_#'] && (
            <InfoRow label="Parcel #" value={property.details['parcel_#']} />
          )}
          {property.addressLine && (
            <InfoRow label="Street Address" value={property.addressLine} />
          )}
          {property.state && (
            <InfoRow label="State" value={property.state} />
          )}
          {property.zipCode && (
            <InfoRow label="Zip Code" value={property.zipCode} />
          )}
          {property.uniqueIdentifier && (
            <InfoRow label="Unique ID" value={property.uniqueIdentifier} />
          )}
          {property.scrapingStatus && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Scraping Status</span>
              {getStatusBadge(property.scrapingStatus)}
            </div>
          )}
          {property.lastAttempt && (
            <InfoRow 
              label="Last Attempt" 
              value={new Date(property.lastAttempt).toLocaleString()} 
            />
          )}
        </div>

        {/* Defendants */}
        {property.defendants && property.defendants.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Defendants ({property.defendants.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {property.defendants.map((defendant) => (
                <Badge key={defendant._id} variant="secondary">
                  {defendant.firstName} {defendant.lastName}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {property.errorMessage && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>Error:</strong> {property.errorMessage}
            </p>
          </div>
        )}
      </CardContent>
      </Card>

      {/* Status History */}
      {property.status_history && property.status_history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Status History</CardTitle>
            {property.status_header && (
              <CardDescription className="text-xs">{property.status_header}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {property.status_history.map((status, index) => (
                <div
                  key={status._id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        index === property.status_history.length - 1
                          ? 'bg-primary'
                          : 'bg-muted-foreground/40'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{status.status}</p>
                      <p className="text-xs text-muted-foreground">{status.date}</p>
                    </div>
                  </div>
                  {index === property.status_history.length - 1 && (
                    <Badge variant="default" className="text-xs h-5">Current</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-medium text-right ${highlight ? 'text-primary text-lg' : ''}`}>
        {value}
      </span>
    </div>
  );
}
