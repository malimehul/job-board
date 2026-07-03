"use client";

import React from "react";
import { X } from "lucide-react";

interface ModalProps {
    open: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

export default function DeleteJobModal({
    open,
    title,
    children,
    onClose,
}: ModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl px-4">
                <div className="flex items-center justify-between border-b py-4">
                    <h2 className="font-semibold">{title}</h2>

                    <button onClick={onClose}>
                        <X className="h-5 w-5 cursor-pointer" />
                    </button>
                </div>

                <div className="py-4">{children}</div>
            </div>
        </div>
    );
}