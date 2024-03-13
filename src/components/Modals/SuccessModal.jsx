"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check, CheckCircle, CheckCircle2, Trash2 } from "lucide-react";

const SuccessModal = ({ children,name }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex justify-center  flex-col gap-5">
        <div className="rounded-full text-white bg-green-500 flex items-center justify-center p-2 max-w-fit">
          <Check />
        </div>
        <div>
          <h3 className="text-2xl font-bold leading-8">Congratulations</h3>
          <p className="font-medium text-grey">
            Your {name} has been successfully created.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
