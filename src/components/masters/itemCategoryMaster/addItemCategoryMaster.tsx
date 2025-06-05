"use client";
import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import router from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";


interface ItemCategoryFormData{
    categoryName: string,
    storeIds: string[],
    parentCategoryId: string,
    description: string
}
const AddItemCategoryMaster : React.FC = () => {
    const [itemCategoryFormData, setItemCategoryFormData] = useState<ItemCategoryFormData>({
        categoryName: "",
        storeIds: [],
        parentCategoryId: "",
        description: ""
    })
    const router = useRouter();
    const {showToast} = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        const {name, value, type, checked} = e.target;
        setItemCategoryFormData({
            ...itemCategoryFormData
        })
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
          console.log(itemCategoryFormData)
          const { response, status } = await BackendRequest("/api/masters/taxMaster/addTaxMaster", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: itemCategoryFormData })
          });
    
          if (status === 201 || response?.response?.statusCode === 201) {
            router.push("/masters/taxMaster/taxMasterByStoreId");
            showToast(response?.response.data.message);
          } else {
            showToast(response?.response?.message || "Failed to add item");
          }
        } catch (err) {
          console.log(err)
          showToast("something went wrong while adding taxMaster")
        }
    
      };

    return(
        <></>
    )
};
export default AddItemCategoryMaster;