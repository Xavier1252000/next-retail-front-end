"use client";
import ToastCloseIcon from "@/icons/toast-close-icon";
import ToastIcons from "@/icons/toast-icons";
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";

type ToastContextType = {
    showToast: (
        message: string,
        variant?: "success" | "warn" | "error"
    ) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [variant, setVariant] = useState<"success" | "warn" | "error">();
    const [message, setMessage] = useState("");

    const showToast = useCallback(
        (msg: string, variant?: "success" | "warn" | "error") => {
            setMessage(msg);
            setIsVisible(true);
            setVariant(variant);
            setTimeout(() => setIsVisible(false), 5000);
        },
        []
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {isVisible && (
                <div className="popup-animation fixed top-5 left-1/2 transform -translate-x-1/2 text-white rounded-md shadow-lg z-50 flex items-center space-x-2 ">
                    <div className="flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow ">
                        {variant && <ToastIcons variant={variant} />}
                        <div className="ms-3 text-sm font-semibold mr-1">
                            {message}
                        </div>
                        <button
                            type="button"
                            className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 "
                            aria-label="Close"
                            onClick={() => setIsVisible(false)}
                        >
                            <ToastCloseIcon />
                        </button>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};
