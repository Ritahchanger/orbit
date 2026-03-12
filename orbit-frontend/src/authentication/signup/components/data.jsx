import {
  FileText,
  Users,
  CreditCard,
  Store,
  Lock,
  Package,
  Globe,
  Shield,
  AlertTriangle,
  X
} from "lucide-react";
export const SECTIONS = [
  {
    id: "acceptance",
    icon: FileText,
    title: "1. Acceptance of Terms",
    content: `By registering your business on the Orbit platform ("Platform"), you ("Business Owner", "You") agree to be bound by these Terms of Service ("Terms"). These Terms constitute a legally binding agreement between you and Orbit Technologies Ltd ("Orbit", "We", "Us").

If you are registering on behalf of a company or organization, you represent that you have the authority to bind that entity to these Terms. If you do not agree to these Terms, do not register or use the Platform.

We reserve the right to modify these Terms at any time. Continued use of the Platform following notification of changes constitutes acceptance of the revised Terms.`,
  },
  {
    id: "platform",
    icon: Store,
    title: "2. Platform Services",
    content: `Orbit provides a comprehensive business management platform including:

- Point of Sale (POS) System — Process transactions, manage cash drawers, generate receipts, and handle multiple payment methods including M-Pesa, card, and cash.

- Multi-Store Management — Centrally manage multiple store locations, transfer stock between stores, and maintain consolidated reporting across your entire business network.

- Inventory Management — Real-time stock tracking, automated reorder alerts, supplier management, purchase orders, and full audit trails of all stock movements.

- Staff & User Management — Role-based access control for your team members across all store locations.

- Analytics & Reporting — Business intelligence dashboards, sales reports, profit/loss statements, and inventory valuations.

Service availability is subject to your active subscription plan. Features may vary between plans.`,
  },
  {
    id: "registration",
    icon: Users,
    title: "3. Business Registration & Accounts",
    content: `3.1 Eligibility: You must be at least 18 years of age and legally authorized to conduct business in Kenya or the jurisdiction where your business operates.

3.2 Accurate Information: You agree to provide accurate, current, and complete information during registration, including your business registration number, tax PIN, and contact details. Providing false information is grounds for immediate account termination.

3.3 Account Security: You are responsible for maintaining the confidentiality of your administrator credentials. You must immediately notify Orbit of any unauthorized access to your account. Orbit will not be liable for losses arising from compromised credentials.

3.4 Verification: Newly registered businesses are subject to a verification process. Your account may be in "pending" status until our team reviews your registration details. Access to certain features may be restricted during this period.

3.5 One Business Per Account: Each business entity must have a separate registration. You may not use one account to manage legally distinct business entities without explicit written consent from Orbit.`,
  },
  {
    id: "subscription",
    icon: CreditCard,
    title: "4. Subscriptions & Payments",
    content: `4.1 Plans: Orbit offers Starter, Professional, and Enterprise subscription plans. Features, store limits, and user limits vary by plan. Full plan details are available on our pricing page.

4.2 Trial Period: New registrations receive a 30-day free trial. No payment method is required during the trial. At the end of the trial, your account will require an active subscription to continue accessing paid features.

4.3 Billing: Subscriptions are billed monthly or annually depending on your selected billing cycle. Annual subscriptions receive a 20% discount. All prices are in Kenyan Shillings (KES) unless otherwise stated.

4.4 Payment Methods: We accept M-Pesa, major credit/debit cards, and bank transfers. You authorize Orbit to charge your selected payment method on each billing date.

4.5 Late Payment: Failure to pay within 7 days of a failed payment attempt may result in service suspension. Your data is retained for 90 days following suspension before permanent deletion.

4.6 Refunds: Subscription fees are non-refundable except where required by Kenyan consumer protection law. Unused days of a billing period are not credited upon cancellation.

4.7 Price Changes: Orbit reserves the right to change subscription prices with 30 days' written notice. Continuing to use the Platform after a price change constitutes acceptance.`,
  },
  {
    id: "data",
    icon: Lock,
    title: "5. Data & Privacy",
    content: `5.1 Your Data: All business data you enter into the Platform (sales records, inventory, customer information, employee data) remains your property. Orbit does not claim ownership of your business data.

5.2 Data Processing: By using the Platform, you grant Orbit a limited license to store, process, and transmit your data solely for the purpose of providing the Services.

5.3 Data Security: Orbit implements industry-standard security measures including encryption at rest and in transit, regular security audits, and access controls. However, no system is 100% secure and we cannot guarantee absolute security.

5.4 Customer Data: If you collect customer personal data through the Platform (e.g., customer records for loyalty programs), you are the data controller. You must comply with Kenya's Data Protection Act, 2019. Orbit acts as a data processor on your behalf.

5.5 Data Export: You may export your business data at any time from the Platform settings. We provide data in standard formats (CSV, JSON).

5.6 Data Retention: Upon account termination, your data is retained for 90 days, after which it is permanently deleted from our systems.`,
  },
  {
    id: "pos",
    icon: Package,
    title: "6. POS & Transaction Rules",
    content: `6.1 Transaction Accuracy: You are solely responsible for ensuring transaction accuracy, correct pricing, applicable taxes (VAT, etc.), and compliance with KRA requirements. Orbit provides tools but does not guarantee tax compliance.

6.2 Payment Integrations: Orbit integrates with Safaricom M-Pesa (Daraja API) and other payment providers. Transaction fees charged by payment providers are separate from Orbit subscription fees and are your responsibility.

6.3 Receipts & ETR: If your business is required to use an Electronic Tax Register (ETR) under KRA regulations, you are responsible for compliance. Orbit's receipt system is not a substitute for legally required ETR compliance.

6.4 Cash Handling: Orbit is not responsible for cash discrepancies, theft, or losses at your physical store locations. The Platform's cash management tools are for record-keeping purposes only.

6.5 Refunds & Returns: Your business's refund and return policies are your own. Orbit provides tools to process returns but does not govern or mediate disputes between your business and your customers.`,
  },
  {
    id: "multistore",
    icon: Globe,
    title: "7. Multi-Store Operations",
    content: `7.1 Store Limits: The number of store locations you may manage is determined by your subscription plan. Exceeding your plan's store limit requires an upgrade.

7.2 Stock Transfers: Inter-store stock transfers are recorded in the Platform. You are responsible for physical verification of transferred goods. Orbit is not liable for discrepancies between recorded and physical inventory.

7.3 Store-Level Users: You may assign staff to specific stores or grant access across multiple locations. Superadmin users have full access to all stores. You are responsible for managing user permissions appropriately.

7.4 Consolidated Reporting: Multi-store reports aggregate data from all your locations. Report accuracy depends on correct data entry by your staff.`,
  },
  {
    id: "conduct",
    icon: Shield,
    title: "8. Acceptable Use & Prohibited Activities",
    content: `You agree NOT to use the Orbit Platform to:

- Register a fraudulent or non-existent business
- Process transactions for illegal goods or services
- Launder money or facilitate financial fraud
- Access or attempt to access other businesses' data
- Reverse engineer, decompile, or copy the Platform's source code
- Use automated scripts or bots to access the Platform
- Violate any applicable Kenyan law or regulation
- Harass, threaten, or harm Orbit staff or other users

Violation of these rules may result in immediate account suspension without refund, and may be reported to relevant authorities including the DCI and KRA.`,
  },
  {
    id: "liability",
    icon: AlertTriangle,
    title: "9. Limitation of Liability",
    content: `9.1 Service Availability: Orbit aims for 99.5% uptime but does not guarantee uninterrupted service. Scheduled maintenance will be announced in advance. We are not liable for losses resulting from downtime.

9.2 Data Loss: While we maintain backups, Orbit is not liable for data loss resulting from user error, third-party system failures, or force majeure events. We recommend maintaining your own business records.

9.3 Financial Losses: Orbit is not liable for any indirect, incidental, special, or consequential damages including lost profits, lost revenue, or business interruption arising from your use of the Platform.

9.4 Maximum Liability: Our total liability to you for any claim shall not exceed the total subscription fees paid by you in the 3 months preceding the claim.

9.5 Indemnification: You agree to indemnify and hold harmless Orbit, its officers, directors, and employees from any claims, damages, or expenses arising from your use of the Platform or violation of these Terms.`,
  },
  {
    id: "termination",
    icon: X,
    title: "10. Termination",
    content: `10.1 By You: You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period.

10.2 By Orbit: We reserve the right to suspend or terminate your account immediately if you violate these Terms, engage in fraudulent activity, fail to pay subscription fees, or if required by law.

10.3 Effect of Termination: Upon termination, your access to the Platform ceases. Your data is retained for 90 days, during which you may request an export. After 90 days, all data is permanently deleted.

10.4 Survival: Sections relating to payment obligations, data privacy, limitation of liability, and governing law survive termination.`,
  },
  {
    id: "governing",
    icon: FileText,
    title: "11. Governing Law & Disputes",
    content: `These Terms are governed by the laws of the Republic of Kenya. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.

Before initiating legal proceedings, both parties agree to attempt resolution through good-faith negotiation for a period of 30 days. If unresolved, disputes may be referred to mediation under the Nairobi Centre for International Arbitration (NCIA) rules.

For any questions about these Terms, contact us at legal@orbit.co.ke.

Last updated: March 2026 | Version 2.1`,
  },
];
