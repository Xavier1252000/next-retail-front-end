import UpdateTaxMaster from "@/components/masters/taxMaster/updateTaxMaster/updateTaxMaster";

// Define SegmentParams to match the auto-generated type
type SegmentParams = { id: string };

interface PageProps {
  params: Promise<SegmentParams>;
  searchParams?: Promise<any>;
}

async function Page({ params }: PageProps) {
  const resolvedParams = await params; // Resolve the Promise
  const id = resolvedParams.id;

  return (
    <div>
      <UpdateTaxMaster taxMasterId={id} />
    </div>
  );
}

export default Page;