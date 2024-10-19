"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/ui";
import Modal from "@/ui/modal";

interface DangerZoneProps {
  knowledgebaseId: string;
  knowledgebaseName: string;
}
// TODO : delete images from storage
export default function DangerZone({
  knowledgebaseId,
  knowledgebaseName,
}: DangerZoneProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/knowledgebase/${knowledgebaseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Knowledgebase deleted successfully!");
        router.push("/"); // Redirect to dashboard
      } else {
        const errorData = await response.json();
        const error = errorData.error || response.statusText;
        toast.error(
          error || "An error occurred while deleting the knowledgebase",
        );
      }
    } catch (error) {
      toast.error("An error occurred while deleting the knowledgebase");
    } finally {
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-black">
        <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
          <div className="flex flex-col space-y-3">
            <h2 className="font-cal text-xl dark:text-white">
              Delete Knowledgebase
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Once you delete a knowledgebase, there is no going back. Please be
              certain.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10 dark:border-stone-700 dark:bg-stone-800">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              text="Delete Knowledgebase"
              variant="danger"
              onClick={() => setShowModal(true)}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className="inline-block w-full transform overflow-hidden bg-white align-middle shadow-xl transition-all sm:max-w-md sm:rounded-2xl sm:border sm:border-stone-200 dark:border-stone-700 dark:bg-black">
          <div className="p-6 sm:p-8">
            <h3 className="font-cal text-2xl dark:text-white">
              Delete Knowledgebase
            </h3>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              Are you sure you want to delete the knowledgebase
              {knowledgebaseName}? This action cannot be undone.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="mt-6 flex flex-col space-y-4"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confirm"
                  name="confirm"
                  required
                  className="h-4 w-4 rounded border-stone-300 text-black focus:ring-black dark:border-stone-700 dark:bg-stone-900 dark:checked:bg-black"
                />
                <label
                  htmlFor="confirm"
                  className="text-sm text-stone-500 dark:text-stone-400"
                >
                  I understand that this action is irreversible.
                </label>
              </div>
              <Button
                text={isDeleting ? "Deleting..." : "Delete Knowledgebase"}
                variant="danger"
                loading={isDeleting}
                disabled={isDeleting}
                type="submit"
              />
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
