import { Eye, Lock, Shield, Store, Trash2, Unlock } from "lucide-react";

const iconButton =
  "rounded-sm p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700";

// The action buttons for one worker, shared by the list and grid views.
// `allowed` comes from the page and already reflects the current user's
// permissions and the rules the API enforces, so hidden actions can't 403.
const UserActions = ({
  user,
  allowed,
  onView,
  onChangeRole,
  onAssignStore,
  onSuspend,
  onUnsuspend,
  onDelete,
}) => (
  <div className="flex items-center gap-1">
    <button
      type="button"
      onClick={() => onView(user)}
      className={iconButton}
      title="View details"
      aria-label="View details"
    >
      <Eye size={16} className="text-gray-600 dark:text-gray-300" />
    </button>

    {allowed.changeRole && (
      <button
        type="button"
        onClick={() => onChangeRole(user)}
        className={iconButton}
        title="Change role"
        aria-label="Change role"
      >
        <Shield size={16} className="text-blue-600 dark:text-blue-400" />
      </button>
    )}

    {allowed.assignStore && (
      <button
        type="button"
        onClick={() => onAssignStore(user)}
        className={iconButton}
        title={user.assignedStore ? "Change store" : "Assign store"}
        aria-label={user.assignedStore ? "Change store" : "Assign store"}
      >
        <Store
          size={16}
          className={
            user.assignedStore
              ? "text-green-600 dark:text-green-400"
              : "text-gray-500 dark:text-gray-400"
          }
        />
      </button>
    )}

    {allowed.suspend &&
      (user.isSuspended ? (
        <button
          type="button"
          onClick={() => onUnsuspend(user)}
          className="rounded-sm p-1.5 text-green-600 transition-colors hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-500/20"
          title="Unsuspend user"
          aria-label="Unsuspend user"
        >
          <Unlock size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onSuspend(user)}
          className="rounded-sm p-1.5 text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-500/20"
          title="Suspend user"
          aria-label="Suspend user"
        >
          <Lock size={16} />
        </button>
      ))}

    {allowed.delete && (
      <button
        type="button"
        onClick={() => onDelete(user)}
        className="rounded-sm p-1.5 text-red-600 transition-colors hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/20"
        title="Delete user"
        aria-label="Delete user"
      >
        <Trash2 size={16} />
      </button>
    )}
  </div>
);

export default UserActions;
