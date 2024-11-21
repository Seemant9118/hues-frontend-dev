import { tokenApi } from '@/api/tokenApi/tokenApi';
import { LocalStorageService } from '@/lib/utils';
import axios from 'axios';

export function refreshToken() {
  const refreshTokenValue = LocalStorageService.get('refreshtoken');
  return axios.get(
    `${process.env.NEXT_PUBLIC_BASE_URL}${tokenApi.refreshToken.endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${refreshTokenValue}`,
      },
    },
  );
}
