"use client";
import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Layers2, Trash2 } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ConfirmAction = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            "gap-2 justify-center mx-auto text-red-500 cursor-pointer relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          )}
        >
          <Trash2 size={12} />
          Delete
        </button>
      </DialogTrigger>
      <DialogContent className="flex justify-center items-center flex-col gap-5">
        <DialogTitle>
          Are you sure you want to delete{" "}
          <span className="text-blue-500 ">John Doe</span>
        </DialogTitle>

        <div className="flex justify-end items-center gap-4 mt-auto">
          <DialogClose asChild>
            <Button onClick={() => {}} variant={"outline"}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={() => {}}>Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmAction;
