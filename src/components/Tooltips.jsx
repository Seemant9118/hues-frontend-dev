import { order_api } from "@/api/order_api/order_api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GetNegotiationDetails } from "@/services/Orders_Services/Orders_Services";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function Tooltips({
  trigger,
  content,
  isContentShow,
  offerDetails,
}) {
  const params = useParams();
  const order_id = params.order_id;
  const item_id = offerDetails?.id;

  const { isLoading, data } = useQuery({
    queryKey: [order_api.getNegotiationDetails.endpointKey],
    queryFn: () => GetNegotiationDetails(order_id, item_id),
    select: (data) => data.data.data,
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{trigger}</TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
          {isContentShow && !isLoading && data && (
            <div className="flex flex-col gap-2 p-4">
              {data.map((negotiationItem) => (
                <div key={negotiationItem.id} className="flex flex-col gap-1">
                  <span>₹{negotiationItem.price}</span>
                  <span className="text-xs text-[#C5C5C4]">{negotiationItem.date}</span>
                </div>
              ))}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
