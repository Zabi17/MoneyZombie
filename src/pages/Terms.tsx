// src/pages/Terms.tsx
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";

const sections = [
  {
    icon: "FileCheck",
    title: "1. Acceptance of Terms",
    body: `By creating an account or using MoneyZombie ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please discontinue use of the App immediately.`,
  },
  {
    icon: "Wallet",
    title: "2. Description of Service",
    body: `MoneyZombie is a personal finance tracking / money managing tool that allows you to record income, expenses, budgets, savings goals, and lends. The App is provided free of charge for personal use.`,
  },
  {
    icon: "LogIn",
    title: "3. Account & Authentication",
    body: `MoneyZombie uses Google OAuth (via Supabase Auth) to let you sign in. When you sign in with Google, we receive basic profile information from your Google account, including your name, email address, and profile picture (pfp), which is displayed within the App.

We do not receive or store your Google password. Authentication is handled entirely by Google and Supabase; we never see your credentials.`,
  },
  {
    icon: "Database",
    title: "4. Data Storage & Privacy",
    body: `Your financial data (transactions, budgets, savings pots, lends, categories) is stored in our Supabase-hosted database, protected by Row Level Security (RLS) policies that restrict access to your own account only.

Unlike a purely local app, your data is transmitted to and stored on Supabase's servers. We take reasonable measures to protect this data, but no system is 100% secure, and you use the App with this understanding.

You may export your data at any time (e.g. via the Excel export feature). If you delete your account, associated data will be removed in line with our data retention practices.`,
  },
  {
    icon: "ShieldAlert",
    title: "5. No Financial Advice",
    body: `MoneyZombie is a tracking and organizational tool only. Nothing in the App constitutes financial, investment, tax, or legal advice. You are solely responsible for the financial decisions you make based on the information you record or view in the App.`,
  },
  {
    icon: "UserCheck",
    title: "6. User Responsibilities",
    body: `You are responsible for:
- The accuracy of the data you enter (transactions, budgets, lends, etc.)
- Keeping your Google account secure, since it controls access to your MoneyZombie data
- Reviewing what Google account permissions you grant during sign-in`,
  },
  {
    icon: "Ban",
    title: "7. Disclaimer of Warranties",
    body: `The App is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to accuracy, reliability, or fitness for a particular purpose. We do not guarantee the App will be error-free, uninterrupted, or secure.`,
  },
  {
    icon: "Scale",
    title: "8. Limitation of Liability",
    body: `To the fullest extent permitted by law, MoneyZombie and its creator(s) shall not be liable for any indirect, incidental, or consequential damages — including loss of data, unauthorized access, or financial loss — arising from your use of, or inability to use, the App.`,
  },
  {
    icon: "RefreshCw",
    title: "9. Changes to These Terms",
    body: `We may update these Terms and Conditions from time to time. Continued use of the App after changes are posted constitutes your acceptance of the revised terms. We recommend checking this page periodically.`,
  },
  {
    icon: "Mail",
    title: "10. Contact",
    body: `If you have questions about these Terms, please reach out via the contact links on the Settings page.`,
  },
];

export default function Terms() {
  return (
    <>
      <title>Terms & Conditions — MoneyZombie</title>
      <meta
        name="description"
        content="Terms and conditions for using MoneyZombie, a free money manager."
      />
      <div className="min-h-screen bg-background px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/settings"
            className="mb-6 inline-flex items-center gap-1 text-sm text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors"
          >
            <Icons.ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>

          <h1 className="font-display text-3xl sm:text-4xl text-(--color-foreground) mb-2">
            Terms & Conditions
          </h1>
          <p className="text-sm text-(--color-muted-foreground) mb-10">
            Last updated: July 22, 2026
          </p>

          <div className="space-y-8">
            {sections.map((section) => {
              const Icon = (Icons as any)[section.icon] ?? Icons.FileText;
              return (
                <section
                  key={section.title}
                  className="rounded-2xl border border-border bg-(--color-card) p-5 sm:p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-5 w-5 text-accent" />
                    <h2 className="font-display text-lg text-(--color-foreground)">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-(--color-muted-foreground) whitespace-pre-line">
                    {section.body}
                  </p>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
