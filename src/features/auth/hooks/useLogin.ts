import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { authApi } from "@/shared/queries/auth/authApi";
import { setCredentials } from "@/shared/redux/slices/authSlice";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/shared/utils/errorHandler";

export const useLogin = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      try {
        const user = await authApi.getMe(data.access_token);
        dispatch(setCredentials({ user, token: data.access_token }));
        toast.success("Logged in successfully!");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
