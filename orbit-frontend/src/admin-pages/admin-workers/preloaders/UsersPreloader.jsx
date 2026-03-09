// UsersPreloader.jsx - IMPROVED VERSION WITH THEME SUPPORT
import React from 'react';

// Enhanced animation with gradient shimmer
const shimmer = `
@keyframes shimmer {
  0% { background-position: -500px 0; }
  100% { background-position: 500px 0; }
}
.shimmer {
  background: linear-gradient(90deg, #e5e7eb 25%, #d1d5db 50%, #e5e7eb 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
.dark .shimmer {
  background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%);
  background-size: 1000px 100%;
}
`;

// Single User Card Skeleton (for grid view)
export const UserSkeleton = () => (
  <div className="animate-pulse">
    <style>{shimmer}</style>
    <div className="relative overflow-hidden bg-white dark:bg-gray-800/30 border border-gray-300 dark:border-gray-700/50 rounded-sm p-4 hover:border-gray-400 dark:hover:border-gray-600/50 transition-all duration-300">
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 shimmer opacity-20 dark:opacity-20"></div>

      <div className="flex items-center space-x-3">
        {/* Avatar with pulse effect */}
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full border-2 border-gray-300 dark:border-gray-700/50"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-400 dark:border-t-gray-600 animate-spin"></div>
        </div>

        {/* User Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-24"></div>
            <div className="h-5 w-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full"></div>
          </div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-32"></div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-20"></div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 h-px bg-gradient-to-r from-transparent via-gray-300/30 dark:via-gray-700/30 to-transparent"></div>

      {/* Stats */}
      <div className="flex justify-between">
        <div className="text-center">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-12 mx-auto mb-1"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-8 mx-auto"></div>
        </div>
        <div className="text-center">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-12 mx-auto mb-1"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-8 mx-auto"></div>
        </div>
        <div className="text-center">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-12 mx-auto mb-1"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-8 mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
);

// Modern Table Skeleton Loader
export const UserSkeletonLoader = ({ count = 5 }) => (
  <div className="animate-pulse">
    <style>{shimmer}</style>

    {/* Table Header */}
    <div className="relative overflow-hidden bg-white dark:bg-gray-800/30 border border-gray-300 dark:border-gray-700/50 rounded-sm p-4">
      <div className="absolute inset-0 shimmer opacity-10 dark:opacity-10"></div>
      <div className="flex items-center justify-between mb-2">
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-32"></div>
        <div className="flex items-center space-x-2">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-24"></div>
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-24"></div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="col-span-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded"></div>
          </div>
        ))}
      </div>
    </div>

    {/* Table Body */}
    <div className="bg-gray-50/20 dark:bg-gray-900/20 border-x border-b border-gray-300 dark:border-gray-700/30 rounded-sm overflow-hidden">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden border-b border-gray-300 dark:border-gray-700/20 last:border-b-0 hover:bg-gray-100/10 dark:hover:bg-gray-800/10 transition-colors duration-300"
        >
          <div className="absolute inset-0 shimmer opacity-5 dark:opacity-5"></div>

          <div className="grid grid-cols-12 gap-4 p-4">
            {/* User */}
            <div className="col-span-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full"></div>
                  <div className="absolute -inset-1 border border-gray-400/30 dark:border-gray-600/30 rounded-full animate-ping opacity-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-32"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-24"></div>
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="col-span-2">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full w-20"></div>
            </div>

            {/* Store */}
            <div className="col-span-2">
              <div className="space-y-1">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-16"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-12"></div>
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <div className="inline-flex items-center space-x-2">
                <div className="h-2 w-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-16"></div>
              </div>
            </div>

            {/* Joined */}
            <div className="col-span-1">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-20"></div>
            </div>

            {/* Actions */}
            <div className="col-span-2">
              <div className="flex items-center justify-end space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded"></div>
                <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded"></div>
                <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Enhanced Grid View Skeleton
export const UserGridSkeletonLoader = ({ count = 6 }) => (
  <div className="animate-pulse">
    <style>{shimmer}</style>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden bg-gradient-to-br from-white to-gray-100/20 dark:from-gray-800/30 dark:to-gray-900/20 border border-gray-300/30 dark:border-gray-700/30 rounded-sm p-5 hover:border-gray-400/50 dark:hover:border-gray-600/50 transition-all duration-500 hover:scale-[1.02]"
        >
          {/* Shimmer background */}
          <div className="absolute inset-0 shimmer opacity-10 dark:opacity-10"></div>

          {/* Header */}
          <div className="relative flex items-start justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full border-2 border-gray-300 dark:border-gray-700/50"></div>
                <div className="absolute -inset-1 border border-gray-400/30 dark:border-gray-600/30 rounded-full animate-ping opacity-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-28"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-20"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full w-16"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full w-6"></div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-300/30 dark:via-gray-700/30 to-transparent"></div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-16"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-12"></div>
            </div>
            <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full w-1/2 shimmer"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-20"></div>
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-sm"></div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Modern Stats Cards
export const StatsSkeletonLoader = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="relative bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-sm p-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-sm mb-2 animate-pulse bg-[length:200%_100%]"></div>
            <div className="h-8 w-20 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded-sm animate-pulse bg-[length:200%_100%]"></div>
          </div>
          <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-sm animate-pulse bg-[length:200%_100%]"></div>
        </div>
        <div className="h-3 w-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-sm mt-2 animate-pulse bg-[length:200%_100%]"></div>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-300/10 dark:via-gray-700/10 to-transparent animate-shimmer"
          style={{ animationDelay: `${i * 150}ms` }}></div>
      </div>
    ))}
  </div>
);

// Tabs Skeleton
export const TabsSkeleton = () => (
  <div className="animate-pulse flex flex-wrap gap-2 mb-6">
    <style>{shimmer}</style>
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="relative overflow-hidden bg-gradient-to-r from-gray-100/50 to-gray-200/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-300/30 dark:border-gray-700/30 rounded-sm px-4 py-3"
      >
        <div className="absolute inset-0 shimmer opacity-10 dark:opacity-10"></div>
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-16"></div>
          <div className="h-5 w-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

// Search Bar Skeleton
export const SearchSkeleton = () => (
  <div className="animate-pulse mb-6">
    <style>{shimmer}</style>
    <div className="relative overflow-hidden bg-gradient-to-r from-gray-100/30 to-gray-200/20 dark:from-gray-800/30 dark:to-gray-900/20 border border-gray-300/30 dark:border-gray-700/30 rounded-sm p-4">
      <div className="absolute inset-0 shimmer opacity-10 dark:opacity-10"></div>
      <div className="relative flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-sm"></div>
          <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-sm flex-1 max-w-md"></div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-sm w-32"></div>
          <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-sm w-32"></div>
        </div>
      </div>
    </div>
  </div>
);

// Empty State Skeleton
export const EmptyStateSkeleton = () => (
  <div className="animate-pulse">
    <style>{shimmer}</style>
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-100/20 to-gray-200/10 dark:from-gray-800/20 dark:to-gray-900/10 border-2 border-dashed border-gray-300/30 dark:border-gray-700/30 rounded-sm p-12 text-center">
      <div className="absolute inset-0 shimmer opacity-5 dark:opacity-5"></div>
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full mx-auto mb-6"></div>
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-48 mx-auto mb-3"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-64 mx-auto mb-6"></div>
        <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-sm w-40 mx-auto"></div>
      </div>
    </div>
  </div>
);

// Export all
export default {
  UserSkeleton,
  UserSkeletonLoader,
  UserGridSkeletonLoader,
  StatsSkeletonLoader,
  TabsSkeleton,
  SearchSkeleton,
  EmptyStateSkeleton
};