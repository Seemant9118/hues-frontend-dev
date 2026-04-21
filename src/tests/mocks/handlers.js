import { http, HttpResponse } from 'msw';

export const handlers = [
  // Example handler for login
  http.post('*/auth/login', () => {
    return HttpResponse.json({
      token: 'mocked_token',
      user: { id: '1', name: 'Test User' },
    });
  }),

  // Example handler for fetching profile
  http.get('*/auth/me', () => {
    return HttpResponse.json({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    });
  }),
];
