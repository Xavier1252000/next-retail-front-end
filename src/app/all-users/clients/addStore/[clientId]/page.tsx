import AddStoreForm from "@/components/users/addClientDetails/store/addStore";

// Define SegmentParams to match the auto-generated type
type SegmentParams = { clientId: string };

interface PageProps {
  params: Promise<SegmentParams>;
  searchParams?: Promise<any>;
}

async function Page({ params }: PageProps) {
  const resolvedParams = await params; // Resolve the Promise
  const clientId = resolvedParams.clientId;

  return (
    <div>
      <AddStoreForm clientId={clientId} />
    </div>
  );
}

export default Page;