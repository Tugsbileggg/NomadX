import { Repeat, UserPlus, Users } from "lucide-react";
import { ArtistPageHeader, ArtistPanel, ArtistShell, ArtistStat } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { CustomerTable, CustomerTabs } from "@/components/customers/CustomerTable";
import { fetchPanelCustomers, type CustomerFilter } from "@/lib/customers/queries";

export const metadata = { title: "Харилцагчид — Артистын админ" };

const FILTERS = ["new", "regular", "inactive"];

export default async function ArtistClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const active = (FILTERS.includes(filter ?? "") ? filter : null) as CustomerFilter;

  const { customers, stats } = await fetchPanelCustomers(active);

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/clients" {...ARTIST}>
      <ArtistPageHeader title="Харилцагчид" chip={`Нийт ${stats.total}`} />

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <ArtistStat label="Нийт харилцагч" value={String(stats.total)} icon={Users} />
          <ArtistStat label="Шинэ энэ сар" value={String(stats.newThisMonth)} icon={UserPlus} />
          <ArtistStat label="Дахин ирсэн" value={`${stats.returningPct}`} suffix="%" icon={Repeat} />
        </div>

        <ArtistPanel>
          <div className="flex flex-col gap-4">
            <CustomerTabs basePath="/artist/clients" active={active} />
            <CustomerTable customers={customers} />
          </div>
        </ArtistPanel>
      </div>
    </ArtistShell>
  );
}
