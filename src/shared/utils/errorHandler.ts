import type { AxiosError } from "axios";

/**
 * Extracts a user-friendly error message from various error types.
 * Handles Axios errors (Network, 5xx, 4xx) and standard JS errors.
 */
export function getErrorMessage(error: unknown): string {
  // Handle Axios Errors
  if (typeof error !== "undefined" && (error as any).isAxiosError) {
    const axiosError = error as AxiosError<any>;

    // 1. Network Error (Backend is completely down, DNS failed, etc.)
    if (axiosError.message === "Network Error") {
      return "Unable to connect to the server. Please check your internet connection or try again later.";
    }

    // 2. Server Errors (5xx - like 502, 503, 500)
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data;

      if (status >= 500) {
        return "The server is currently unavailable. Please try again later.";
      }

      // 3. Client Errors (4xx) - Try to extract backend validation message
      if (data) {
        // FastAPI validation error format
        if (Array.isArray(data.detail) && data.detail.length > 0) {
          return data.detail.map((err: any) => err.msg).join(", ");
        }
        // Standard error message string
        if (typeof data.detail === "string") {
          return data.detail;
        }
        if (typeof data.message === "string") {
          return data.message;
        }
      }
    }

    // Fallback for other Axios errors (timeouts, etc.)
    return axiosError.message;
  }

  // Handle standard JS Errors
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
