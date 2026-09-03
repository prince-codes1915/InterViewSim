import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export const getVapiInstance = (): Vapi => {
  if (typeof window === "undefined") {
    throw new Error("Vapi WebSDK can only be instantiated in browser environments.");
  }

  if (!vapiInstance) {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "mock_vapi_pub_key";
    vapiInstance = new Vapi(publicKey);
  }

  return vapiInstance;
};
