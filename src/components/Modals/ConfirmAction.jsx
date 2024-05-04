"use client";
import React, { useState } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteEnterpriseUser } from "@/services/Enterprises_Users_Service/EnterprisesUsersService";
import { toast } from "sonner";
import { enterprise_user } from "@/api/enterprises_user/Enterprises_users";

const ConfirmAction = ({ name, id, mutationKey, mutationFunc }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: mutationFunc,
    onSuccess: () => {
      toast.success("Deleted successfully");
      setOpen((prev) => !prev);
      queryClient.invalidateQueries({
        queryKey: [mutationKey],
      });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "gap-2 w-full justify-center text-red-500 hover:bg-red-100 cursor-pointer relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          )}
        >
          <Trash2 size={12} />
          Delete
        </button>
      </DialogTrigger>
      <DialogContent className="flex justify-center items-center flex-col gap-5">
        <DialogTitle>
          Are you sure you want to delete{" "}
          <span className="text-blue-500 ">{name}</span>
        </DialogTitle>

        <div className="flex justify-end items-center gap-4 mt-auto">
          <DialogClose asChild>
            <Button
              onClick={() => {
                setOpen((prev) => !prev);
              }}
              variant={"outline"}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={(e) => {
              e.stopPropogation();
              mutation.mutate(id);
            }}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmAction;
