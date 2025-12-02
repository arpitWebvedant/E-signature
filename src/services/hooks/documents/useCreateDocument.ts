import axiosInstance from "@/config/apiConfig";
import { useMutation } from "@tanstack/react-query";

const createDocument = async (documentData: any) => {
    const { data } = await axiosInstance.post(`/api/v1/files/create-document`, documentData);
    return data;
};

const updateDocument = async (formData: FormData) => {
    const { data } = await axiosInstance.post(`/api/v1/files/update-document`, formData);
    return data;
};

export const useCreateDocument = () => {
    return useMutation({
        mutationFn: (documentData: any) => createDocument(documentData),
    });
};

export const useUpdateDocument = () => {
    return useMutation({
        mutationFn: (formData: FormData) => updateDocument(formData),
    });
};
