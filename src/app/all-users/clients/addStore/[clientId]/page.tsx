import AddStoreForm from "@/components/users/addClientDetails/store/addStore"

function Page({ params }: { params: { clientId: string } }) {
  const clientId = params.clientId;

  return (
    <div>
      <h1>
        <AddStoreForm clientId={clientId} />
      </h1>
    </div>
  );
}

export default Page;
