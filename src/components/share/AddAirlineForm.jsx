import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

import { useCreateAirlineMutation } from "../../redux/features/airlines/airlineApiSlice";
import { Bird } from "lucide-react";
import { Loader2 } from "lucide-react";

const AddAirlineForm = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: "",
      name: "",
    },
  });

  const [createAirline, { isLoading }] = useCreateAirlineMutation();

  const onSubmit = async (formData) => {
    const payload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
    };

    try {
      const response = await createAirline(payload).unwrap();

      reset();

      Swal.fire({
        icon: "success",
        title: "Airline added successfully!",
        timer: 1200,
        showConfirmButton: false,
      });

      onSuccess?.(response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to add airline",
        text: error?.data?.message || "Please try again.",
      });
    }
  };

  return (
    <div className="rounded-xl">
      <div className="flex overflow-hidden rounded-xl">
        <input
          type="text"
          placeholder="Code"
          maxLength={3}
          {...register("code", {
            required: "Code is required",
            onChange: (event) => {
              event.target.value = event.target.value.toUpperCase();
            },
          })}
          className={`w-16 rounded-l-xl border px-3 py-2.5 text-xx uppercase outline-none focus:ring-2 focus:ring-blue-500/20 ${
            errors.code ? "border-red-500 bg-red-50/30" : "border-gray-200"
          }`}
        />

        <input
          type="text"
          placeholder="Airline name"
          {...register("name", {
            required: "Airline name is required",
          })}
          className={`min-w-0 flex-1 border-y border-r px-3 py-2.5 text-xx outline-none focus:ring-2 focus:ring-blue-500/20 ${
            errors.name ? "border-red-500 bg-red-50/30" : "border-gray-200"
          }`}
        />

        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          className="border border-blue-600 bg-blue-600 cursor-pointer px-3 py-2.5 text-xx font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
        </button>
      </div>
    </div>
  );
};

export default AddAirlineForm;
