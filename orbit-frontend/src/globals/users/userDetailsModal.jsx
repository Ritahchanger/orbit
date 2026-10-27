import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Ban,
  Calendar,
  KeyRound,
  Mail,
  Store,
  User as UserIcon,
  X,
} from "lucide-react";

import { closeModal } from "../../admin-pages/products/redux/more-user-slice";
import { useGetUserById } from "../../admin-pages/hooks/users.hook";
import { useAuth } from "../../context/authentication/AuthenticationContext";
import { isFeatureEnabled } from "../../config/features";
import DetailSection from "./details/DetailSection";
import DetailRow from "./details/DetailRow";
import StorePermissionsList from "./details/StorePermissionsList";
import { UserRoleBadge, UserStatusBadge } from "./details/UserBadges";

// Must match the duration-300 transition classes below
const TRANSITION_MS = 300;

const SIZES = {
  sm: "sm:w-96",
  md: "sm:w-[560px]",
  lg: "sm:w-[720px]",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const fullName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Unnamed user";

// Locks page scroll while the drawer is open, padding by the real scrollbar
// width so the page behind doesn't jump.
const useScrollLock = (active) => {
  useEffect(() => {
    if (!active) return undefined;
    const { body, documentElement } = document;
    const previous = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    };
  }, [active]);
};

const UserDetailsModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { isOpen, title, size, position, userData } = useSelector(
    (state) => state.userModal,
  );

  // `entered` drives the slide/fade; it flips one frame after mounting so the
  // transition runs, and back before unmounting so closing animates too.
  const [entered, setEntered] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(frame);
      setEntered(false);
    };
  }, [isOpen]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const handleClose = useCallback(() => {
    setEntered(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(
      () => dispatch(closeModal()),
      TRANSITION_MS,
    );
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  useScrollLock(isOpen);

  // Load the full record (store names, who suspended them). The list row is
  // shown until it arrives; mutations refresh this query, so it stays current.
  const { data, isError } = useGetUserById(isOpen ? userData?._id : null);
  const user = data?.data || userData;

  if (!isOpen) return null;

  const fromLeft = position === "left";
  const hiddenOffset = fromLeft ? "-translate-x-full" : "translate-x-full";
  const suspendedBy = user?.suspendedBy;
  const canManagePermissions = userRole === "superadmin" && user?._id;

  return (
    <div className="fixed inset-0 z-[9998]" role="presentation">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 motion-reduce:transition-none dark:bg-black/70 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title || "User details"}
        className={`absolute top-0 flex h-full w-full flex-col border-gray-200 bg-gray-50 shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-900 ${
          fromLeft ? "left-0 border-r" : "right-0 border-l"
        } ${SIZES[size] || SIZES.md} ${entered ? "translate-x-0" : hiddenOffset}`}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex min-w-0 items-center gap-3">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <UserIcon size={22} />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                {user ? fullName(user) : title || "User details"}
              </h2>
              {user && (
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <UserRoleBadge role={user.role} />
                  <UserStatusBadge user={user} />
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-sm p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {!user ? (
            <p className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
              No user selected.
            </p>
          ) : (
            <>
              {isError && (
                <p className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  Couldn't load the latest details; showing what the list had.
                </p>
              )}

              <DetailSection icon={Mail} title="Contact">
                <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                  <DetailRow label="Email">
                    <span className="break-all">{user.email}</span>
                  </DetailRow>
                  <DetailRow label="Phone">{user.phoneNo || "—"}</DetailRow>
                  {isFeatureEnabled("newsletter") && (
                    <DetailRow label="Newsletter">
                      {user.newsletter ? "Subscribed" : "Not subscribed"}
                    </DetailRow>
                  )}
                </dl>
              </DetailSection>

              {user.isSuspended && (
                <DetailSection icon={Ban} title="Suspension" tone="danger">
                  <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                    <DetailRow label="Reason">
                      {user.suspensionReason || "No reason given"}
                    </DetailRow>
                    <DetailRow label="Suspended on">
                      {formatDate(user.suspendedAt)}
                    </DetailRow>
                    <DetailRow label="Suspended by">
                      {suspendedBy && typeof suspendedBy === "object"
                        ? fullName(suspendedBy)
                        : "—"}
                    </DetailRow>
                  </dl>
                </DetailSection>
              )}

              <DetailSection icon={Store} title="Store access">
                <dl className="mb-3 divide-y divide-gray-100 dark:divide-gray-700">
                  <DetailRow label="Assigned store">
                    {user.assignedStore?.name || "None"}
                  </DetailRow>
                  <DetailRow label="All stores">
                    {user.canAccessAllStores || user.role === "superadmin"
                      ? "Yes"
                      : "No"}
                  </DetailRow>
                </dl>
                <StorePermissionsList
                  storePermissions={user.storePermissions}
                  storeRoles={user.storeRoles}
                />
              </DetailSection>

              <DetailSection icon={Calendar} title="Activity">
                <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                  <DetailRow label="Last sign-in">
                    {formatDate(user.lastLoginAt)}
                  </DetailRow>
                  <DetailRow label="Account created">
                    {formatDate(user.createdAt)}
                  </DetailRow>
                  <DetailRow label="Last updated">
                    {formatDate(user.updatedAt)}
                  </DetailRow>
                </dl>
              </DetailSection>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="flex justify-end gap-3 border-t border-gray-200 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          {canManagePermissions && (
            <button
              type="button"
              onClick={() => {
                handleClose();
                navigate(`/admin/settings/${user._id}`);
              }}
              className="inline-flex items-center gap-2 rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <KeyRound size={16} />
              Manage permissions
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="rounded-sm border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default UserDetailsModal;
