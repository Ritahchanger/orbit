import { useState } from "react";
import AdminLayout from "../../dashboard/layout/Layout";

import { useNewsletterMutations } from "../../hooks/useNewsletterMutations";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import NewsletterApi from "../../services/newsletter-api";
import { Users, Mail, BarChart3 } from "lucide-react";
import ComposeTab from "../components/ComposeTab";
import Subscribers from "../components/Subscribers";
import AnalyticsTab from "../components/AnalyticsTab";
import StatsCard from "../components/StatsCard";

const AdminNewsletter = () => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("subscribed");
  const [searchEmail, setSearchEmail] = useState("");
  const [activeTab, setActiveTab] = useState("compose");
  const [expandedSubscriber, setExpandedSubscriber] = useState(null);

  const {
    sendNewsletter,
    isSendingNewsletter,
    unsubscribe,
    isUnsubscribing,
    updatePreferences,
    isUpdatingPreferences,
  } = useNewsletterMutations();

  // Fetch subscribers - FIXED
  const {
    data: subscribersResponse = {},
    isLoading: isLoadingSubscribers,
    refetch: refetchSubscribers,
    isRefetching: isRefetchingSubscribers,
  } = useQuery({
    queryKey: ["newsletter-subscribers", filterStatus],
    queryFn: () =>
      NewsletterApi.getSubscribers(
        filterStatus !== "all"
          ? { subscribed: filterStatus === "subscribed" }
          : {},
      ),
  });

  // Extract subscribers array from response
  const subscribers = subscribersResponse?.data || [];

  // Fetch stats - FIXED
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["newsletter-stats"],
    queryFn: async () => {
      try {
        const response = await NewsletterApi.getSubscribers({});
        const allSubscribers = response?.data || []; // Extract data array
        const total = allSubscribers.length || 0;
        const subscribed =
          allSubscribers.filter((s) => s.subscribed).length || 0;
        const unsubscribed = total - subscribed;

        // Calculate recent activity (last 30 days)
        const lastMonth = new Date();
        lastMonth.setDate(lastMonth.getDate() - 30);
        const recentSubscribers = allSubscribers.filter((s) => {
          const subscribedDate = s.subscribedAt || s.createdAt;
          return s.subscribed && new Date(subscribedDate) > lastMonth;
        }).length;

        return {
          total,
          subscribed,
          unsubscribed,
          recentSubscribers,
          activePercentage:
            total > 0 ? Math.round((subscribed / total) * 100) : 0,
        };
      } catch (error) {
        console.error("Error fetching stats:", error);
        return {
          total: 0,
          subscribed: 0,
          unsubscribed: 0,
          recentSubscribers: 0,
          activePercentage: 0,
        };
      }
    },
  });

  // Handle content update from editor
  const handleContentChange = (html) => {
    setContent(html);
  };

  // Generate campaign ID
  const generateCampaignId = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.random().toString(36).substring(2, 8);
    return `campaign-${date}-${random}`;
  };

  // Send newsletter
  const handleSendNewsletter = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter newsletter content");
      return;
    }

    if (stats?.subscribed === 0) {
      toast.error("No active subscribers to send newsletter to");
      return;
    }

    const finalCampaignId = campaignId || generateCampaignId();

    const sendData = {
      subject: subject.trim(),
      content: content,
      campaignId: finalCampaignId,
    };

    try {
      await sendNewsletter(sendData);
      // Reset form after successful send
      setSubject("");
      setContent("");
      setCampaignId("");
      setSelectedSubscribers([]);
      toast.success("Newsletter queued for sending!");
    } catch (error) {
      console.error("Newsletter send error:", error);
    }
  };

  const selectAllSubscribers = () => {
    const currentSubscribers = subscribers.filter(
      (s) =>
        s.subscribed &&
        (!searchEmail ||
          s.email.toLowerCase().includes(searchEmail.toLowerCase())),
    );

    if (selectedSubscribers.length === currentSubscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(currentSubscribers.map((s) => s.email));
    }
  };

  // Handle unsubscribe
  const handleUnsubscribe = async (email) => {
    if (!confirm(`Are you sure you want to unsubscribe ${email}?`)) return;

    try {
      await unsubscribe({ email });
      toast.success(`${email} unsubscribed successfully`);
      refetchSubscribers();
      refetchStats();
    } catch (error) {
      console.error("Unsubscribe error:", error);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter subscribers based on search and status - FIXED
  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch =
      !searchEmail ||
      subscriber.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "subscribed" && subscriber.subscribed) ||
      (filterStatus === "unsubscribed" && !subscriber.subscribed);
    return matchesSearch && matchesStatus;
  });

  // Tabs configuration
  const tabs = [
    { id: "compose", label: "Compose Newsletter", icon: <Mail size={18} /> },
    { id: "subscribers", label: "Subscribers", icon: <Users size={18} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
  ];
  return (
    <AdminLayout>
      <div className="p-4 md:p-6 newsletter">
        {/* Header */}
        <div className="flex space-x-1 mb-4 md:mb-2 border-b border-gray-300 dark:border-[#2D2D2D]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 md:py-3 text-sm md:text-base font-medium transition-all ${
                activeTab === tab.id
                  ? "text-blue-600 dark:text-[#0066FF] border-b-2 border-blue-600 dark:border-[#0066FF] bg-gray-100 dark:bg-[#1E1E1E]"
                  : "text-gray-600 dark:text-[#B0B0B0] hover:text-gray-900 dark:hover:text-[#F0F0F0] hover:bg-gray-100 dark:hover:bg-[#1E1E1E]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Cards - Show in all tabs */}
        <StatsCard isLoadingStats={isLoadingStats} stats={stats} />

        {/* Tab Content */}
        {activeTab === "compose" && (
          <ComposeTab
            subject={subject}
            setSubject={setSubject}
            setCampaignId={setCampaignId}
            generateCampaignId={generateCampaignId}
            campaignId={campaignId}
            handleContentChange={handleContentChange}
            handleSendNewsletter={handleSendNewsletter}
            isSendingNewsletter={isSendingNewsletter}
            stats={stats}
            content={content}
          />
        )}

        {activeTab === "subscribers" && (
          <Subscribers
            searchEmail={searchEmail}
            setSearchEmail={setSearchEmail}
            setFilterStatus={setFilterStatus}
            refetchSubscribers={refetchSubscribers}
            handleUnsubscribe={handleUnsubscribe}
            setSelectedSubscribers={setSelectedSubscribers}
            isLoadingSubscribers={isLoadingSubscribers}
            filteredSubscribers={filteredSubscribers}
            expandedSubscriber={expandedSubscriber}
            selectedSubscribers={selectedSubscribers}
            isUnsubscribing={isUnsubscribing}
            filterStatus={filterStatus}
            isRefetchingSubscribers={isRefetchingSubscribers}
            selectAllSubscribers={selectAllSubscribers}
            formatDate={formatDate}
            copyToClipboard={copyToClipboard}
          />
        )}

        {activeTab === "analytics" && <AnalyticsTab stats={stats} />}
      </div>
    </AdminLayout>
  );
};

export default AdminNewsletter;
