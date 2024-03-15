import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from 'lucide-react';

export default function Tooltips({content}) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger><Info size={12} /></TooltipTrigger>
                <TooltipContent>
                    <p>{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};