import type { Metadata } from "next";
import { addSlotAction, removeSlotAction, setCapacityAction } from "@/app/actions/dashboard";
import { Button, Card, EmptyState, SectionLabel } from "@/components/ui";
import { providerIsTransactable, resolveDashboardProvider } from "@/lib/dashboard";
import { formatMoney } from "@/lib/money";
import { slotsForProvider } from "@/lib/repo";

export const metadata: Metadata = { title: "Timetable" };

interface Props {
  searchParams: Promise<{ as?: string }>;
}

export default async function SchedulePage({ searchParams }: Props) {
  const { as } = await searchParams;
  const provider = resolveDashboardProvider(as);
  const transactable = providerIsTransactable(provider);
  const slots = slotsForProvider(provider.id);

  return (
    <div>
      <SectionLabel>Timetable</SectionLabel>
      <h1 className="mt-2 text-3xl">Manage your schedule</h1>
      <p className="mt-1 text-sm text-sage-600">
        {provider.name} · changes publish immediately
        {transactable
          ? "; capacity is enforced at booking (SCH-6)."
          : "; capacity shows as availability guidance only (SCH-10)."}
      </p>

      <div className="mt-8 space-y-3">
        {slots.length === 0 && (
          <EmptyState title="No published classes yet">
            Add your first class below — it appears on your public page right away.
          </EmptyState>
        )}
        {slots.map((slot) => (
          <Card key={slot.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-52">
              <p className="font-medium text-forest">{slot.what}</p>
              <p className="text-sm text-sage-600">
                {slot.day} {slot.time} · {slot.where}
              </p>
            </div>
            <p className="text-sm">{slot.price ? formatMoney(slot.price) : "Donation"}</p>
            <form action={setCapacityAction} className="ml-auto flex items-center gap-2">
              <input type="hidden" name="slotId" value={slot.id} />
              <label className="text-xs text-sage-600" htmlFor={`cap-${slot.id}`}>
                Capacity ({slot.booked} booked)
              </label>
              <input
                id={`cap-${slot.id}`}
                name="capacity"
                type="number"
                min={Math.max(1, slot.booked)}
                defaultValue={slot.capacity}
                className="w-20 rounded-lg border border-forest/20 px-2 py-1 text-sm"
              />
              <Button type="submit" tone="outline">
                Save
              </Button>
            </form>
            <form action={removeSlotAction}>
              <input type="hidden" name="slotId" value={slot.id} />
              <Button type="submit" tone="ghost">
                Remove
              </Button>
            </form>
          </Card>
        ))}
      </div>

      <Card className="mt-10 p-6">
        <h2 className="text-lg">Add a class</h2>
        <form action={addSlotAction} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input type="hidden" name="providerId" value={provider.id} />
          <Field name="what" label="Class name" placeholder="Vinyasa Flow, All Levels" />
          <Field name="day" label="Day" placeholder="Tuesday" />
          <Field name="time" label="Time" placeholder="18:00 – 19:15" />
          <Field name="where" label="Location" placeholder="Main studio" />
          <Field name="capacity" label="Capacity" type="number" placeholder="20" />
          <Field
            name="priceMinor"
            label="Price (cents, 0 = donation)"
            type="number"
            placeholder="2400"
          />
          <div className="sm:col-span-3">
            <Button type="submit">Publish class</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs uppercase tracking-wide text-sage-600">{label}</span>
      <input
        name={name}
        type={type}
        required
        min={type === "number" ? 0 : undefined}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-forest/20 px-3 py-2"
      />
    </label>
  );
}
