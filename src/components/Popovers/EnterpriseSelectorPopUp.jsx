'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import {
  capitalize,
  goToHomePage,
  parseJwt,
  redirectToHomeWithFcm,
} from '@/appUtils/helperFunctions';
import { Button } from '@/components/ui/button';
import { cn, LocalStorageService } from '@/lib/utils';
import {
  getSearchedEnterprises,
  revertSwitchedEnterprise,
  switchEnterprise,
} from '@/services/Admin_Services/AdminServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, Box, ListRestart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Tooltips from '../auth/Tooltips';
import Loading from '../ui/Loading';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import SearchInput from '../ui/SearchInput';

const DEBOUNCE_DELAY = 500;

export default function EnterpriseSelectorPopUp() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const switchedEnterpriseName = LocalStorageService.get(
    'switchedEnterpriseName',
  );
  const [selected, setSelected] = useState(switchedEnterpriseName || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // revertSwitchedEnterprise
  const revertSwitchedEnterpriseMutation = useMutation({
    mutationKey: [AdminAPIs.revertSwitchedEnterprise.endpointKey],
    mutationFn: revertSwitchedEnterprise,
    onSuccess: (data) => {
      // eslint-disable-next-line camelcase
      const { access_token, refresh_token } = data.data.data;

      // update tokens
      LocalStorageService.set('token', access_token);
      LocalStorageService.set('refreshtoken', refresh_token);

      // clear switched enterprise
      LocalStorageService.remove('switchedEnterpriseId');
      LocalStorageService.remove('switchedEnterpriseName');

      // ✅ store success flag for after reload
      LocalStorageService.set(
        'switchSuccessMessage',
        'Enterprise reverted to admin view',
      );

      // reload immediately
      window.location.href = goToHomePage();
    },
    onError: () => {
      toast.error('Failed to revert admin view. Please try again.');
    },
  });

  const handleRevert = (enterprise) => {
    revertSwitchedEnterpriseMutation.mutate(enterprise?.enterpriseId);
  };

  // switchEnterprise
  // mutation fn still only expects enterpriseId
  const switchEnterpriseMutation = useMutation({
    mutationKey: [AdminAPIs.switchEnterprise.endpointKey],
    mutationFn: ({ enterpriseId }) => switchEnterprise({ enterpriseId }),
    onSuccess: (data, variables) => {
      // store tokens
      // eslint-disable-next-line camelcase
      const { access_token, refresh_token } = data.data.data;
      LocalStorageService.set('token', access_token);
      LocalStorageService.set('refreshtoken', refresh_token);

      const tokenData = parseJwt(access_token);
      LocalStorageService.set(
        'switchedEnterpriseId',
        Number(tokenData?.enterprise_id),
      );
      LocalStorageService.set(
        'switchedEnterpriseName',
        variables?.enterpriseName,
      );

      // ✅ store flag for post-reload handling
      LocalStorageService.set(
        'switchSuccessMessage',
        `Now viewing as ${capitalize(variables?.enterpriseName)}`,
      );

      // reload immediately
      redirectToHomeWithFcm(router);
    },
    onError: () => {
      toast.error('Failed to switch enterprise. Please try again.');
    },
  });

  // handleSelect passes the full object
  const handleSelect = (enterprise) => {
    switchEnterpriseMutation.mutate({
      enterpriseId: enterprise?.enterpriseId,
      enterpriseName: enterprise?.enterpriseName, // keep name for UI
    });
  };

  // Global handler (runs after reload, same as before)
  useEffect(() => {
    const msg = LocalStorageService.get('switchSuccessMessage');
    if (msg) {
      toast.success(msg);
      LocalStorageService.remove('switchSuccessMessage');
      setSelected(LocalStorageService.get('switchedEnterpriseName'));
    }
  }, []);

  const { data: searchedEnterpriseData, isLoading: isLoadingSearch } = useQuery(
    {
      queryKey: [
        AdminAPIs.getSearchedEnterprise.endpointKey,
        debouncedSearchTerm,
      ],
      queryFn: () => getSearchedEnterprises(debouncedSearchTerm),
      enabled: !!debouncedSearchTerm,
      select: (res) => res.data.data,
    },
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  return (
    <div className="flex w-full items-center justify-between">
      {/* Selected label (non-clickable) */}
      <span
        variant="ghost"
        className={cn(
          'flex flex-1 items-center justify-start gap-2.5 rounded-sm border-none p-3 font-normal text-[#363940]',
          selected && 'text-primary',
        )}
      >
        <Box size={16} />
        <span className="max-w-[140px] truncate text-sm">
          {capitalize(selected) || 'View as Enterprise'}
        </span>
      </span>

      {/* Arrow icon triggers the popover */}
      <Popover open={open} onOpenChange={setOpen}>
        {selected ? (
          <Tooltips
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 text-gray-600 hover:text-primary"
                onClick={handleRevert}
              >
                <ListRestart size={16} />
              </Button>
            }
            content="Revert back to admin view"
          />
        ) : (
          <Tooltips
            trigger={
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    open
                      ? 'h-6 w-6 p-0 text-primary'
                      : 'h-6 w-6 p-0 text-gray-600 hover:text-primary'
                  }
                  debounceTime={0}
                >
                  <ArrowRight size={16} />
                </Button>
              </PopoverTrigger>
            }
            content="Search and select an enterprise to view as"
          />
        )}

        {/* Let Radix handle positioning */}
        <PopoverContent
          side="right"
          align="start"
          className="flex max-h-[300px] w-[350px] flex-col gap-5 border bg-gray-100 p-3 shadow-md"
        >
          <SearchInput
            searchPlaceholder="Search and select an enterprise"
            toSearchTerm={searchTerm}
            setToSearchTerm={setSearchTerm}
          />
          <div className="scrollBarStyles flex max-h-[200px] flex-col gap-1 overflow-y-auto">
            {searchTerm?.length === 0 && (
              <div className="flex w-full items-center justify-center gap-1 rounded-md border bg-white/70 px-4 py-3 text-xs backdrop-blur-sm">
                Search and select an enterprise to view as
              </div>
            )}
            {isLoadingSearch && <Loading />}
            {!isLoadingSearch && searchedEnterpriseData?.length === 0 && (
              <span className="text-center text-sm">No results found.</span>
            )}
            {!isLoadingSearch &&
              searchedEnterpriseData?.length > 0 &&
              searchedEnterpriseData?.map((item) => (
                <button
                  key={item?.enterpriseId}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full cursor-pointer rounded px-2 py-2 text-left text-sm hover:bg-primary hover:text-white"
                >
                  {capitalize(item?.enterpriseName)}
                </button>
              ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
