import type { DashboardData } from "@/types/dashboard";

export const dashboardData: DashboardData = {
  successProbability: 72,
  successCopy: "Your business is likely to succeed in this market with the right changes.",
  revenueForecast: "₦4.2M - ₦6.8M",
  revenueSubtitle: "Expected Monthly Revenue",
  revenueTrend: [18, 22, 19, 27, 23, 25, 31, 26, 30, 28, 36],
  metrics: [
    {
      label: "Total Customers Simulated",
      value: "1,000",
      tone: "neutral",
      iconSrc: "/assets/3d/avatars/person.png",
      iconAlt: "3D customer avatar",
    },
    {
      label: "Total Conversations",
      value: "3,842",
      tone: "primary",
      iconSrc: "/assets/3d/icons/chat-bubble.png",
      iconAlt: "3D chat bubble",
    },
    {
      label: "Purchase Rate",
      value: "23.7%",
      tone: "primary",
      iconSrc: "/assets/3d/illustrations/money-bag.png",
      iconAlt: "3D money bag",
    },
    {
      label: "Repeat Rate",
      value: "11.3%",
      tone: "primary",
      iconSrc: "/assets/3d/illustrations/rocket.png",
      iconAlt: "3D rocket",
    },
  ],
  activity: [
    {
      simulation: "Shawarma Spot Menu",
      targetMarket: "Lagos, Nigeria",
      status: "Completed",
      successScore: "72%",
      revenueForecast: "₦4.2M - ₦6.8M",
      date: "May 20, 2024",
    },
    {
      simulation: "FreshFarm Delivery App",
      targetMarket: "Abuja, Nigeria",
      status: "Completed",
      successScore: "61%",
      revenueForecast: "₦2.1M - ₦3.7M",
      date: "May 18, 2024",
    },
    {
      simulation: "StudyBuddy Online Tutoring",
      targetMarket: "Lagos, Nigeria",
      status: "Completed",
      successScore: "48%",
      revenueForecast: "₦1.2M - ₦2.5M",
      date: "May 15, 2024",
    },
  ],
};

export function getDashboardData(): DashboardData {
  return dashboardData;
}
