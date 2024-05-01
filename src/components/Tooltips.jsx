import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Tooltips({ trigger, content, isContentShow }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{trigger}</TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
          {isContentShow && (
            <div className="flex flex-col gap-2 p-4">
              <div className="flex flex-col gap-1">
                <span>$448</span>
                <span className="text-xs text-[#C5C5C4]">24 Feb, 2024</span>
              </div>
              <div className="flex flex-col gap-1">
                <span>$448</span>
                <span className="text-xs text-[#C5C5C4]">24 Feb, 2024</span>
              </div>
              <div className="flex flex-col gap-1">
                <span>$448</span>
                <span className="text-xs text-[#C5C5C4]">24 Feb, 2024</span>
              </div>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
