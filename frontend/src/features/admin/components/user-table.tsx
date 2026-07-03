"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, X } from "lucide-react";

interface UserTableProps {
  users: User[];
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  isPendingAction?: boolean;
}

export function UserTable({
  users,
  onSuspend,
  onActivate,
  isPendingAction = false,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<"suspend" | "activate" | null>(null);

  const handleActionClick = (user: User, action: "suspend" | "activate") => {
    setSelectedUser(user);
    setConfirmAction(action);
  };

  const handleConfirmSubmit = () => {
    if (!selectedUser || !confirmAction) return;

    if (confirmAction === "suspend") {
      onSuspend(selectedUser._id);
    } else {
      onActivate(selectedUser._id);
    }

    setSelectedUser(null);
    setConfirmAction(null);
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <p className="text-sm text-muted">No users found matching the selected filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-250/60 dark:border-zinc-800 text-xxs font-bold text-muted uppercase tracking-wider">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm text-ink dark:text-zinc-250">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-950 dark:text-zinc-50">{user.name}</div>
                    <div className="text-xs text-muted mt-0.5">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === "Admin"
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-350"
                          : user.role === "Recruiter"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-350"
                          : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-350"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.status === "active"
                          ? "bg-success-light/20 text-success"
                          : "bg-error-light/20 text-error"
                      }`}
                    >
                      {user.status === "active" ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle text-muted">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right align-middle">
                    <div className="flex gap-2 justify-end items-center">
                      {user.role === "Admin" ? (
                        <span className="text-xs text-muted italic">Protected (Admin)</span>
                      ) : user.status === "active" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActionClick(user, "suspend")}
                          disabled={isPendingAction}
                          className="cursor-pointer text-xs border-red-200 dark:border-red-950 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 mr-1 inline" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActionClick(user, "activate")}
                          disabled={isPendingAction}
                          className="cursor-pointer text-xs border-green-200 dark:border-green-950 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-1 inline" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 shadow-xl px-6 py-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="font-bold text-ink dark:text-zinc-50 capitalize">
                {confirmAction} User Account
              </h2>
              <button onClick={() => { setSelectedUser(null); setConfirmAction(null); }}>
                <X className="h-5 w-5 text-muted hover:text-ink cursor-pointer" />
              </button>
            </div>

            <div className="py-4">
              <p className="text-sm text-zinc-650 dark:text-zinc-350">
                Are you sure you want to <span className="font-bold">{confirmAction}</span> the account for{" "}
                <span className="font-semibold text-ink dark:text-zinc-200">{selectedUser.name}</span> (
                {selectedUser.email})?
              </p>
              {confirmAction === "suspend" && (
                <p className="text-xs text-red-500 mt-2">
                  Suspended users will be blocked from signing in or using platform features.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="outline"
                onClick={() => { setSelectedUser(null); setConfirmAction(null); }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSubmit}
                className={`cursor-pointer text-white ${
                  confirmAction === "suspend"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserTable;
