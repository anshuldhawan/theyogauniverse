import type { Metadata } from "next";
import { saveNotificationPreferencesAction } from "@/app/actions/notifications";
import { Button, Card, SectionLabel } from "@/components/ui";
import { resolveDashboardProvider } from "@/lib/dashboard";
import {
  MARKETING_TOPICS,
  NOTIFICATION_CHANNELS,
  notificationPreferencesFor,
} from "@/lib/messaging";

export const metadata: Metadata = { title: "Notification preferences" };

export default function NotificationPreferencesPage() {
  const provider = resolveDashboardProvider();
  const preferences = notificationPreferencesFor(provider.id);

  return (
    <div>
      <SectionLabel>MSG-4 / MSG-6</SectionLabel>
      <h1 className="mt-2 text-3xl">Notification preferences</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sage-600">
        Marketing starts off and is controlled by topic and channel. Booking receipts and important
        account notices continue by email. SMS is transactional and opt-in.
      </p>

      <form action={saveNotificationPreferencesAction} className="mt-8 space-y-6">
        <input type="hidden" name="subjectId" value={provider.id} />
        <Card className="p-6">
          <h2 className="text-lg">Transactional</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Preference label="Email (required)" checked disabled />
            <Preference
              name="transactional:web_push"
              label="Browser push"
              checked={preferences.transactional.web_push}
            />
            <Preference
              name="transactional:sms"
              label="SMS (explicit opt-in)"
              checked={preferences.transactional.sms}
            />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-mint-200 p-6">
            <h2 className="text-lg">Marketing topics</h2>
            <p className="mt-1 text-sm text-sage-600">Unchecked means no consent.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left text-sm">
              <thead className="bg-mint text-xs uppercase tracking-wider text-sage-600">
                <tr>
                  <th className="p-4">Topic</th>
                  {NOTIFICATION_CHANNELS.map((channel) => (
                    <th key={channel} className="p-4">{channel.replace("_", " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MARKETING_TOPICS.map((topic) => (
                  <tr key={topic} className="border-t border-mint-200">
                    <th className="p-4 font-medium capitalize">{topic}</th>
                    {NOTIFICATION_CHANNELS.map((channel) => (
                      <td key={channel} className="p-4">
                        <input
                          type="checkbox"
                          name={`marketing:${channel}:${topic}`}
                          defaultChecked={preferences.marketing[channel][topic] === true}
                          aria-label={`${topic} by ${channel}`}
                          className="size-4 accent-forest"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Button type="submit" tone="forest">Save preferences</Button>
      </form>
    </div>
  );
}

function Preference({
  name,
  label,
  checked,
  disabled,
}: {
  name?: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-mint-200 p-4">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        disabled={disabled}
        className="size-4 accent-forest"
      />
      <span>{label}</span>
    </label>
  );
}
