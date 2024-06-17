import { orderApi } from '@/api/order_api/order_api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GetNegotiationDetails } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export default function ToolTipOrder({ trigger, offerDetails }) {
  const params = useParams();
  const orderId = params.order_id;
  const itemId = offerDetails?.id;

  const { isLoading, data } = useQuery({
    queryKey: [orderApi.getNegotiationDetails.endpointKey],
    queryFn: () => GetNegotiationDetails(orderId, itemId),
    select: () => data.data.data,
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger type="button">{trigger}</TooltipTrigger>
        <TooltipContent>
          {!isLoading && data && (
            <div className="flex flex-col gap-2 p-4">
              {data.map((negotiationItem) => (
                <div key={negotiationItem.id} className="flex flex-col gap-1">
                  <span>₹{negotiationItem.price}</span>
                  <span className="text-xs text-[#C5C5C4]">
                    {negotiationItem.date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
