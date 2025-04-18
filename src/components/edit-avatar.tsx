"use client";

import { Progress } from "@/components/ui/progress";
import { useUploadThing } from "@/utils/uploadthing";
import { cn } from "@/lib/utils";
import {
  Image as ImageIcon,
  Loader2,
  MousePointerSquareDashed,
} from "lucide-react";
import { useState, useTransition } from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { updateAvatarUrl } from "@/db/database";
import { ToastVariant } from "@/db/enums";

const EditAvatar = () => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: ([data]) => {
      const imageUrl = data.ufsUrl;
      const uploadUserId = data.serverData.uploadedBy;
      startTransition(async () => {
        const request = await updateAvatarUrl(uploadUserId, imageUrl);
        switch (request.variant) {
          case ToastVariant.Success:
            toast.success(
              request.title,
              {
                description: request.description,
              },
            );
            break;
          default:
            toast.error(
              request.title,
              {
                description: request.description,
              },
            );
        }
      });
    },
    onUploadProgress: (p) => {
      setUploadProgress(p);
    },
  });

  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    const [file] = rejectedFiles;

    setIsDragOver(false);

    toast.error(
      `${file.file.type} type is not supported`,
      {
        description: "Please upload a PNG, JPG or JPEG file instead.",
      },
    );
  };
  const onDropAccepted = (acceptedFiles: File[]) => {
    startUpload(acceptedFiles);
    setIsDragOver(false);
  };

  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Edit Avatar</h3>
        <p className="text-sm text-muted-foreground">
          Upload your profile picture here.
        </p>
      </div>
      <div
        className={cn(
          "relative h-full flex-1 w-full rounded-xl ring-gray-400/25 bg-input/30 my-2 ring-1 ring-inset lg:rounded-2xl flex justify-center flex-col items-center",
          {
            "ring-blue-900/25 bg-blue-900/10": isDragOver,
          },
        )}
      >
        <div className="relative flex flex-1 flex-col items-center justify-center w-full">
          <Dropzone
            onDropRejected={onDropRejected}
            onDropAccepted={onDropAccepted}
            accept={{
              "image/png": [".png"],
              "image/jpeg": [".jpeg"],
              "image/jpg": [".jpg"],
            }}
            onDragEnter={() => setIsDragOver(true)}
            onDragLeave={() => setIsDragOver(false)}
          >
            {({ getRootProps, getInputProps }) => (
              <div
                className="h-full w-full flex flex-1 flex-col items-center justify-center py-10"
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                {isDragOver
                  ? (
                    <MousePointerSquareDashed className="h-6 w-6 text-zinc-500 mb-2" />
                  )
                  : isUploading || isPending
                    ? (
                      <Loader2 className="animate-spin h-6 w-6 text-zinc-500 mb-2" />
                    )
                    : <ImageIcon className="h-6 w-6 text-zinc-500 mb-2" />}
                <div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">
                  {isUploading
                    ? (
                      <div className="flex flex-col items-center">
                        <p className="pb-2 text-zinc-500">Uploading...</p>
                        <Progress
                          value={uploadProgress}
                          className="mt-2 w-40 h-2 dark:bg-input"
                        />
                      </div>
                    )
                    : isPending
                      ? (
                        <div className="flex flex-col items-center">
                          <p>Redirecting, please wait...</p>
                        </div>
                      )
                      : isDragOver
                        ? (
                          <p>
                            <span className="font-semibold text-zinc-500">
                              Drop file&nbsp;
                            </span>
                            <span className="text-zinc-500">
                              to upload
                            </span>
                          </p>
                        )
                        : (
                          <p>
                            <span className="font-semibold text-zinc-500">
                              Click to upload
                            </span>
                            &nbsp;<span className="text-zinc-500">
                              or drag and drop
                            </span>
                          </p>
                        )}
                </div>
                {isPending
                  ? null
                  : <p className="text-xs text-zinc-500">PNG, JPG, JPEG</p>}
              </div>
            )}
          </Dropzone>
        </div>
      </div>
    </div>
  );
};

export default EditAvatar;
