import { createOpenMercatoClient, type components, type paths } from '@open-mercato/client';

const DEFAULT_BASE_URL = process.env.OPEN_MERCATO_API_BASE_URL ?? 'https://demo.openmercato.com/api';

const client = createOpenMercatoClient({
  baseUrl: DEFAULT_BASE_URL,
});

export type DealsQuery = NonNullable<paths['/customers/deals']['get']['parameters']['query']>;
export type DealsResponse = components['schemas']['DocPathsCustomersDealsGetResponses200ContentApplicationJsonSchema'];
export type Deal = DealsResponse['items'][number];

const DEFAULT_QUERY: DealsQuery = {
  page: 1,
  pageSize: 10,
  sortField: 'updated_at',
  sortDir: 'desc',
};

function assertApiKey(): string {
  const apiKey = process.env.OPEN_MERCATO_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPEN_MERCATO_API_KEY is not configured. Create .env.local (see README) before running the app.',
    );
  }
  return apiKey;
}

export async function fetchDeals(params?: DealsQuery): Promise<DealsResponse> {
  client.setAccessToken(assertApiKey());

  const { data, error } = await client.GET('/customers/deals', {
    params: {
      query: { ...DEFAULT_QUERY, ...(params ?? {}) },
    },
  });

  if (error) {
    const detail = (error as { error?: string }).error;
    throw new Error(detail ?? 'Unable to load deals from Open Mercato.');
  }

  const fallbackPage = params?.page ?? DEFAULT_QUERY.page;
  const fallbackPageSize = params?.pageSize ?? DEFAULT_QUERY.pageSize;

  return (
    data ?? {
      items: [],
      total: 0,
      totalPages: 0,
      page: fallbackPage,
      pageSize: fallbackPageSize,
    }
  );
}
