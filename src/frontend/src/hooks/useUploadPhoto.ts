import {
  loadConfig,
  useInternetIdentity,
} from "@caffeineai/core-infrastructure";
import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useState } from "react";

export function useUploadPhoto() {
  const { identity } = useInternetIdentity();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadPhoto = useCallback(
    async (file: File): Promise<string> => {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const config = await loadConfig();

        // Guard against runtime undefined / "undefined" string values
        const bucketName = config.bucket_name;
        const gatewayUrl = config.storage_gateway_url;
        const canisterId = config.backend_canister_id;
        const projectId = config.project_id;

        if (
          !bucketName ||
          bucketName === "undefined" ||
          !gatewayUrl ||
          gatewayUrl === "undefined" ||
          !canisterId ||
          canisterId === "undefined" ||
          !projectId ||
          projectId === "undefined"
        ) {
          throw new Error(
            "Photo storage is not configured. Please try again later.",
          );
        }

        const agentOptions: { host?: string; identity?: typeof identity } = {};
        if (config.backend_host) agentOptions.host = config.backend_host;
        if (identity) agentOptions.identity = identity;

        const agent = new HttpAgent(agentOptions);
        if (config.backend_host?.includes("localhost")) {
          await agent.fetchRootKey().catch(() => {});
        }

        const storageClient = new StorageClient(
          bucketName,
          gatewayUrl,
          canisterId,
          projectId,
          agent,
        );

        const bytes = new Uint8Array(await file.arrayBuffer());
        const { hash } = await storageClient.putFile(bytes, (pct) => {
          setUploadProgress(pct);
        });

        const url = await storageClient.getDirectURL(hash);
        return url;
      } finally {
        setIsUploading(false);
      }
    },
    [identity],
  );

  return { uploadPhoto, isUploading, uploadProgress };
}
