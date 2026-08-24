import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { vehicleService } from "@/lib/services";
import { inr } from "@/lib/format";
import { StatusBadge } from "@/components/fleet/status-badge";

export const Route = createFileRoute("/vehicles/$id")({
  head: () => ({
    meta: [
      { title: "Vehicle details — FleetFlow" },
      {
        name: "description",
        content:
          "Specifications, availability and daily pricing for this FleetFlow rental vehicle.",
      },
      { property: "og:title", content: "Vehicle details — FleetFlow" },
      {
        property: "og:description",
        content: "Specifications, availability and daily pricing for this FleetFlow vehicle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VehicleDetail,
});

function VehicleDetail() {
  const { id } = Route.useParams();
  const { data: vehicle, isPending } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => vehicleService.get(id),
  });

  if (isPending) {
    return <div className="p-10 text-sm text-muted-foreground">Loading vehicle…</div>;
  }

  if (!vehicle) {
    return (
      <div className="p-10">
        <h1 className="text-xl font-semibold">Vehicle not found</h1>
        <Link to="/" className="mt-3 inline-block text-sm text-primary underline">
          Back to fleet
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <p className="eyebrow">
        {vehicle.category} · {vehicle.location}
      </p>
      <h1 className="mt-2 text-2xl font-semibold">{vehicle.name}</h1>
      <div className="mt-3">
        <StatusBadge status={vehicle.status} />
      </div>
      <img
        src={vehicle.image}
        alt={vehicle.name}
        className="mt-6 aspect-16/10 w-full rounded-xl object-cover"
      />
      <p className="mt-6 text-sm text-muted-foreground">{vehicle.description}</p>
      <p className="mt-6">
        <span className="num text-2xl font-semibold">{inr(vehicle.pricePerDay)}</span>
        <span className="ml-1 text-sm text-muted-foreground">/ day</span>
      </p>
    </div>
  );
}
