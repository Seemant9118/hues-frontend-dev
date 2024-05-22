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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ConfirmAction = ({ name, id, mutationKey, mutationFunc }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const deleteHandler = async (id) => {
    try {
      const response = await mutationFunc(id);
      toast.success("Deleted successfully");
      setOpen((prev) => !prev);
      queryClient.invalidateQueries({
        queryKey: [mutationKey],
      });
    } catch (error) {
      toast.error(error.response.data.message || "Something went wrong");
    }
  };

  // const mutation = useMutation({
  //   mutationKey: [id],
  //   mutationFn: mutationFunc,
  //   onSuccess: () => {
  //     toast.success("Deleted successfully");
  //     setOpen((prev) => !prev);
  //     queryClient.invalidateQueries({
  //       queryKey: [mutationKey],
  //     });
  //   },
  //   onError: (error) => {
  //     toast.error(error.response.data.message || "Something went wrong");
  //   },
  // });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
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
              // mutation.mutate(id);
              deleteHandler(id);
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
